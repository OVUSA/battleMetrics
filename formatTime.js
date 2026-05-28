/**
 * utils/formatTime.js
 * ---------------------------------------------------------
 * Pure utility functions for formatting time values.
 *
 * "Pure" means: given the same input you always get the
 * same output, and there are no side-effects.
 * This makes these functions trivial to unit-test.
 *
 * USAGE:
 *   import { formatTime } from '../utils/formatTime';
 *   formatTime(3661) // → "1h 1m 1s"
 * ---------------------------------------------------------
 */

/**
 * Converts a total number of seconds into a human-readable
 * time string, e.g. "2h 15m 30s".
 *
 * @param {number} totalSeconds - Must be a non-negative integer.
 * @returns {string} Formatted time string.
 *
 * @example
 * formatTime(45)    // "45s"
 * formatTime(125)   // "2m 5s"
 * formatTime(3661)  // "1h 1m 1s"
 */
export function formatTime(totalSeconds) {
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0)   return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
