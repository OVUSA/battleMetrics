/**
 * server/src/config.js
 * ---------------------------------------------------------
 * All environment variables read in ONE place.
 *
 * WHY THIS MATTERS:
 *   If you scatter `process.env.X` across the codebase,
 *   it's hard to know what config the app needs.
 *   Here it's all visible at a glance, with safe defaults.
 *
 * TO ADD A NEW VAR:
 *   1. Add it here with a default value.
 *   2. Add it to .env.example so teammates know it exists.
 *   3. Use `config.YOUR_VAR` everywhere else.
 * ---------------------------------------------------------
 */

export const config = {
  NODE_ENV:       process.env.NODE_ENV        || "development",
  PORT:           Number(process.env.PORT)    || 3001,

  // AWS DynamoDB
  AWS_REGION:     process.env.AWS_REGION      || "us-east-1",
  DYNAMODB_TABLE: process.env.DYNAMODB_TABLE  || "players",

  // When NODE_ENV=development, use a local DynamoDB instance
  // (e.g. `npx dynamodb-local`). In production this is ignored.
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT || undefined,
};
