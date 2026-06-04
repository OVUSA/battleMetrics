import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config.js';
import { playerRouter } from './playerRoutes.js';

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
  }),
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/players', playerRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticAppPath = path.join(__dirname, '../../client/dist');

app.use(express.static(staticAppPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticAppPath, 'index.html'));
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error.';
  res.status(500).json({ error: message });
});

app.listen(config.port, () => {
  // Keep startup log concise for production-like local runs.
  console.log(`Metrics API running on http://localhost:${config.port}`);
});
