/**
 * server/src/services/dynamoDBClient.js
 * ---------------------------------------------------------
 * All DynamoDB operations live here — one dedicated module
 * per data store. The service layer calls these functions;
 * it never imports the AWS SDK directly.
 *
 * WHY THIS ISOLATION MATTERS:
 *   If you ever switch from DynamoDB to PostgreSQL, only
 *   this file changes. Nothing else in the app needs to know.
 *
 *   In tests you can mock this entire module:
 *     jest.mock('../services/dynamoDBClient.js');
 *   …and the service tests never touch a real database.
 * ---------------------------------------------------------
 */

import { DynamoDBClient }         from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { config } from "../config.js";

// ── Client setup ─────────────────────────────────────────

// Create the low-level client once and reuse it.
// The DocumentClient wrapper lets us work with plain JS
// objects instead of DynamoDB's verbose attribute format.
const baseClient = new DynamoDBClient({
  region:   config.AWS_REGION,
  // In local development, point at a local DynamoDB instance.
  // In production (Lambda/ECS), this is undefined and the SDK
  // uses the default endpoint automatically.
  ...(config.DYNAMODB_ENDPOINT && { endpoint: config.DYNAMODB_ENDPOINT }),
});

const docClient = DynamoDBDocumentClient.from(baseClient);

// ── Query functions ───────────────────────────────────────

/**
 * Fetches a single player record by their player number.
 *
 * Returns the raw DynamoDB item, or null if not found.
 * The caller (playerService.js) is responsible for
 * transforming this into the API response shape.
 *
 * @param {string} playerNumber
 * @returns {Promise<RawPlayerRecord | null>}
 *
 * @typedef {Object} RawPlayerRecord
 * @property {string}                    playerNumber
 * @property {string}                    name
 * @property {{ date: string, durationSeconds: number }[]} sessions
 * @property {number}                    totalSeconds   - Pre-computed aggregate.
 * @property {string}                    createdAt
 * @property {string}                    updatedAt
 */
export async function queryPlayerById(playerNumber) {
  const command = new GetCommand({
    TableName: config.DYNAMODB_TABLE,
    Key:       { playerNumber },
  });

  const response = await docClient.send(command);

  // `Item` is undefined when the key doesn't exist in DynamoDB.
  // We convert that to null so callers get a consistent return type.
  return response.Item ?? null;
}
