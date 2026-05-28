/**
 * api/playerApi.js
 * ---------------------------------------------------------
 * All communication with the backend lives in this file.
 *
 * WHY THIS MATTERS:
 *   Components should never call `fetch` directly.
 *   By centralising API calls here you get:
 *     1. One place to update if the API URL changes.
 *     2. One place to add auth headers (e.g. JWT token).
 *     3. Components stay clean — they just call functions.
 *
 * TO SWITCH FROM MOCK TO REAL API:
 *   Replace the MOCK section below with a real fetch()
 *   call to your AWS API Gateway endpoint.
 *   Nothing else in the app needs to change.
 *
 * USAGE:
 *   import { getPlayer } from '../api/playerApi';
 *   const player = await getPlayer("12345678");
 * ---------------------------------------------------------
 */

// ── Configuration ────────────────────────────────────────
// In a real app this comes from an environment variable:
//   const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = "/api/v1";

// ── Mock data (remove when connecting to real API) ───────
const MOCK_DB = {
  "12345678": { name: "Jordan Mitchell", sessions: [120, 95, 200, 85, 310]         },
  "87654321": { name: "Alex Rivera",     sessions: [60, 45, 180, 220]              },
  "11223344": { name: "Sam Chen",        sessions: [300, 270, 180, 90, 150, 200]   },
  "99887766": { name: "Morgan Lee",      sessions: [45, 30, 60]                    },
};

/**
 * Fetches a single player's data by their 8-digit number.
 *
 * Returns a normalised Player object so the rest of the app
 * never needs to know about the raw API response shape.
 *
 * @param {string} playerNumber - Validated 8-digit string.
 * @returns {Promise<Player>} Resolved player object.
 * @throws {Error} If the player is not found or the request fails.
 *
 * @typedef {Object} Player
 * @property {string}   playerNumber  - e.g. "12345678"
 * @property {string}   name          - e.g. "Jordan Mitchell"
 * @property {number[]} sessions      - Array of session durations in seconds.
 * @property {number}   totalSeconds  - Pre-computed sum of all sessions.
 */
export async function getPlayer(playerNumber) {
  // ── MOCK (delete this block and uncomment fetch below) ──
  await new Promise((resolve) => setTimeout(resolve, 600)); // Simulates network delay
  const raw = MOCK_DB[playerNumber];
  if (!raw) throw new Error("Player not found.");
  return normalisePlayer(playerNumber, raw);

  // ── REAL API (uncomment when backend is ready) ──────────
  // const response = await fetch(`${BASE_URL}/players/${playerNumber}`, {
  //   headers: {
  //     "Content-Type": "application/json",
  //     // "Authorization": `Bearer ${getAuthToken()}`,
  //   },
  // });
  //
  // if (!response.ok) {
  //   // Parse the error message the server sent back
  //   const body = await response.json().catch(() => ({}));
  //   throw new Error(body.message || "Player not found.");
  // }
  //
  // const raw = await response.json();
  // return normalisePlayer(playerNumber, raw);
}

// ── Private helpers ──────────────────────────────────────

/**
 * Converts raw API data into the shape the app expects.
 * If the API response shape ever changes, only this
 * function needs updating.
 *
 * @param {string} playerNumber
 * @param {{ name: string, sessions: number[] }} raw
 * @returns {Player}
 */
function normalisePlayer(playerNumber, raw) {
  return {
    playerNumber,
    name:         raw.name,
    sessions:     raw.sessions,
    totalSeconds: raw.sessions.reduce((sum, s) => sum + s, 0),
  };
}
