/**
 * server/src/app.js
 * ---------------------------------------------------------
 * Creates and configures the Express application.
 * Separating this from index.js means tests can import
 * `app` directly without binding to a port.
 * ---------------------------------------------------------
 */

import express        from "express";
import cors           from "cors";
import { playerRouter } from "./routes/playerRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

export const app = express();

// ── Global middleware ─────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// Allow the React frontend to call this API
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));

// Log every request (method, path, status, duration)
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────

// All player endpoints live under /api/v1/players
// Versioning the path means we can add /api/v2 later
// without breaking existing clients.
app.use("/api/v1/players", playerRouter);

// ── Health check ──────────────────────────────────────────
// Used by AWS ALB / ECS to confirm the service is alive.
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── 404 catch-all ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ── Global error handler (must be last) ───────────────────
app.use(errorHandler);
