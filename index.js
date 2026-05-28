/**
 * server/src/index.js
 * ---------------------------------------------------------
 * Application entry point. Starts the HTTP server.
 *
 * Keeping this file minimal means the app object (app.js)
 * can be imported by tests WITHOUT starting a real server.
 * ---------------------------------------------------------
 */

import { app }    from "./app.js";
import { config } from "./config.js";

app.listen(config.PORT, () => {
  console.log(`✅  Server running on port ${config.PORT} [${config.NODE_ENV}]`);
});
