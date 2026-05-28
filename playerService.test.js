/**
 * server/tests/playerService.test.js
 * ---------------------------------------------------------
 * Unit tests for the player service layer.
 *
 * Because the service has NO dependency on Express or HTTP,
 * these tests are plain function calls — fast and simple.
 *
 * We mock dynamoDBClient.js so tests never need a real
 * database. This is the payoff of isolating DB calls.
 *
 * Run with: npm test
 * ---------------------------------------------------------
 */

import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock the database module before importing the service.
// When playerService calls queryPlayerById, it gets our fake.
jest.mock("../src/services/dynamoDBClient.js");
import { queryPlayerById } from "../src/services/dynamoDBClient.js";
import { getPlayerById }   from "../src/services/playerService.js";

// ── Test data ─────────────────────────────────────────────

const MOCK_RAW_PLAYER = {
  playerNumber: "12345678",
  name:         "Jordan Mitchell",
  sessions: [
    { date: "2025-01-01", durationSeconds: 120 },
    { date: "2025-01-02", durationSeconds: 200 },
    { date: "2025-01-03", durationSeconds:  80 },
  ],
  createdAt: "2025-01-01T10:00:00Z",
  updatedAt: "2025-01-03T18:00:00Z",
};

// ── Tests ─────────────────────────────────────────────────

describe("getPlayerById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a player with the correct total playtime", async () => {
    // Arrange: the mock DB returns our fake player
    queryPlayerById.mockResolvedValue(MOCK_RAW_PLAYER);

    // Act
    const result = await getPlayerById("12345678");

    // Assert: totalSeconds is the sum of all session durations
    expect(result.totalSeconds).toBe(400); // 120 + 200 + 80
    expect(result.playerNumber).toBe("12345678");
    expect(result.name).toBe("Jordan Mitchell");
  });

  it("returns null when the player does not exist", async () => {
    // Arrange: the mock DB returns null (player not found)
    queryPlayerById.mockResolvedValue(null);

    // Act
    const result = await getPlayerById("99999999");

    // Assert
    expect(result).toBeNull();
  });

  it("does not expose internal database fields", async () => {
    queryPlayerById.mockResolvedValue(MOCK_RAW_PLAYER);

    const result = await getPlayerById("12345678");

    // These are DynamoDB internals — they should never reach the API consumer
    expect(result).not.toHaveProperty("createdAt");
    expect(result).not.toHaveProperty("updatedAt");
  });
});
