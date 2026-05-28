/**
 * server/src/services/playerService.js
 * ---------------------------------------------------------
 * All business logic for players lives here.
 *
 * A SERVICE is responsible for:
 *   - Calling the database (or a repository layer)
 *   - Transforming raw data into the shape the API returns
 *   - Applying business rules (e.g. computing totals)
 *
 * Services know NOTHING about HTTP (no req/res).
 * This means every function here can be called and tested
 * as plain JavaScript — no Express needed.
 * ---------------------------------------------------------
 */

import { queryPlayerById } from "./dynamoDBClient.js";

/**
 * Fetches a player by their number and enriches the data
 * with computed aggregates (total playtime).
 *
 * @param {string} playerNumber - Validated 8-digit string.
 * @returns {Promise<PlayerResponse | null>} null if not found.
 *
 * @typedef {Object} PlayerResponse
 * @property {string}   playerNumber
 * @property {string}   name
 * @property {Session[]} sessions
 * @property {number}   totalSeconds
 *
 * @typedef {Object} Session
 * @property {string} date             - ISO date string.
 * @property {number} durationSeconds  - Session length.
 */
export async function getPlayerById(playerNumber) {
  // Fetch the raw record from DynamoDB
  const rawPlayer = await queryPlayerById(playerNumber);

  // Return null so the controller can send a clean 404
  if (!rawPlayer) return null;

  // Compute the total from individual sessions.
  // We store the pre-computed value in DynamoDB too (via Streams),
  // but recalculating here keeps this endpoint correct even if
  // the stored aggregate is temporarily stale.
  const totalSeconds = rawPlayer.sessions.reduce(
    (sum, session) => sum + session.durationSeconds,
    0
  );

  // Return only the fields the API should expose.
  // Never return raw DynamoDB internals (e.g. internal IDs).
  return {
    playerNumber: rawPlayer.playerNumber,
    name:         rawPlayer.name,
    sessions:     rawPlayer.sessions,
    totalSeconds,
  };
}
