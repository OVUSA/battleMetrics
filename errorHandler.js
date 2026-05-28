/**
 * server/src/middleware/errorHandler.js
 * ---------------------------------------------------------
 * Global error-handling middleware for Express.
 * Must be registered LAST in app.js (after all routes).
 *
 * Any route or middleware that calls next(error) ends up
 * here. This means error formatting lives in one place —
 * not scattered across every controller.
 *
 * Express identifies error handlers by their 4 parameters:
 * (err, req, res, next) — all four are required.
 * ---------------------------------------------------------
 */

/**
 * @type {import('express').ErrorRequestHandler}
 */
export function errorHandler(err, req, res, _next) {
  // Log the full error server-side for debugging.
  // In production, pipe this to CloudWatch or a log aggregator.
  console.error(`[ERROR] ${req.method} ${req.path}`, err);

  // Never expose raw error messages to the client in production —
  // they can leak implementation details or stack traces.
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.statusCode || 500).json({
    message:  isDevelopment ? err.message : "An unexpected error occurred.",
    // Only include stack traces during local development
    ...(isDevelopment && { stack: err.stack }),
  });
}
