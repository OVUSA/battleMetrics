/**
 * server/src/middleware/validatePlayerNumber.js
 * ---------------------------------------------------------
 * Express middleware that validates the :playerNumber URL
 * parameter before it reaches the controller.
 *
 * If validation fails, it responds immediately with a 400
 * and the controller is never called.
 *
 * MIDDLEWARE PATTERN:
 *   function name(req, res, next) {
 *     if (problem) return res.status(400).json({ message });
 *     next(); // pass control to the next handler
 *   }
 * ---------------------------------------------------------
 */

const PLAYER_NUMBER_REGEX = /^\d{8}$/;

/**
 * Validates that :playerNumber is exactly 10 numeric digits.
 *
 * @type {import('express').RequestHandler}
 */
export function validatePlayerNumberParam(req, res, next) {
  const { playerNumber } = req.params;

  if (!PLAYER_NUMBER_REGEX.test(playerNumber)) {
    return res.status(400).json({
      message: "Player number must be exactly 10 digits.",
    });
  }

  // Validation passed — hand control to the next middleware/controller
  next();
}
