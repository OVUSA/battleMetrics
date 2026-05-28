/**
 * utils/validation.js
 * ---------------------------------------------------------
 * Input validation rules for player numbers.
 *
 * Keeping validation here (not inside components or hooks)
 * means: one place to change the rules, and each rule can
 * be imported and tested completely independently.
 *
 * USAGE:
 *   import { validatePlayerNumber } from '../utils/validation';
 *   const error = validatePlayerNumber("123");
 *   if (error) showError(error);
 * ---------------------------------------------------------
 */

/** A player number must be exactly 8 numeric digits. */
const PLAYER_NUMBER_REGEX = /^\d{8}$/;

/**
 * Validates a raw player number string.
 * Returns an error message if invalid, or null if valid.
 *
 * @param {string} value - The raw input string from the user.
 * @returns {string|null} An error message, or null if valid.
 *
 * @example
 * validatePlayerNumber("12345678") // null  ✅
 * validatePlayerNumber("1234")     // "Please enter exactly 8 digits."
 * validatePlayerNumber("abcdefgh") // "Please enter exactly 8 digits."
 */
export function validatePlayerNumber(value) {
  if (!PLAYER_NUMBER_REGEX.test(value.trim())) {
    return "Please enter exactly 8 digits.";
  }
  return null;
}
