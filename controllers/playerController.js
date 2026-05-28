/**
 * server/src/controllers/playerController.js
 * ---------------------------------------------------------
 * Handles the HTTP layer: reads from req, calls the service,
 * and writes to res.
 *
 * Controllers NEVER contain business logic (calculations,
 * database queries). That lives in the service layer.
 * Controllers just translate between HTTP and the service.
 *
 * This separation means you can test business logic without
 * making real HTTP requests.
 * ---------------------------------------------------------
 */

import { getPlayerById } from "../services/playerService.js";

/**
 * GET /api/v1/players/:playerNumber
 *
 * Responds with the player's data including aggregated
 * total playtime, or a 404 if the player doesn't exist.
 *
 * @type {import('express').RequestHandler}
 */
export async function getPlayer(req, res, next) {
  try {
    const { playerNumber } = req.params;

    // Delegate all logic to the service layer
    const player = await getPlayerById(playerNumber);

    // Service returns null when the player doesn't exist
    if (!player) {
      return res.status(404).json({ message: "Player not found." });
    }

    return res.status(200).json(player);
  } catch (error) {
    // Pass unexpected errors to the global error handler (errorHandler.js)
    next(error);
  }
}
