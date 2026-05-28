/**
 * server/src/routes/playerRoutes.js
 * ---------------------------------------------------------
 * Maps HTTP verbs + URL paths to controller functions.
 *
 * Routes should be THIN — no logic here, just wiring.
 * Middleware (validation) runs before the controller.
 *
 * CURRENT ENDPOINTS:
 *   GET /api/v1/players/:playerNumber
 *     → Returns a player's data and aggregated playtime.
 *
 * TO ADD A NEW ENDPOINT:
 *   1. Add the route here.
 *   2. Add a function to playerController.js.
 *   3. Add business logic to playerService.js.
 * ---------------------------------------------------------
 */

import { Router }                  from "express";
import { getPlayer }               from "../controllers/playerController.js";
import { validatePlayerNumberParam } from "../middleware/validatePlayerNumber.js";

export const playerRouter = Router();

// GET /api/v1/players/:playerNumber
// Middleware runs first (validates the URL param), then the controller.
playerRouter.get(
  "/:playerNumber",
  validatePlayerNumberParam,
  getPlayer
);
