/**
 * server/src/middleware/requestLogger.js
 * ---------------------------------------------------------
 * Logs every incoming HTTP request: method, path, status
 * code, and how long it took to respond.
 *
 * In production, replace console.log with a structured
 * logger like `pino` or `winston` so logs can be queried
 * in CloudWatch.
 *
 * Example output:
 *   GET /api/v1/players/12345678 → 200 (45ms)
 * ---------------------------------------------------------
 */

/**
 * @type {import('express').RequestHandler}
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  // `finish` fires after the response has been sent,
  // so we can log the final status code and duration.
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}
