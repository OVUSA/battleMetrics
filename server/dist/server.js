import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { playerRouter } from './playerRoutes.js';
const app = express();
app.use(cors({
    origin: config.corsOrigin,
}));
app.use(express.json());
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/players', playerRouter);
app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    res.status(500).json({ error: message });
});
app.listen(config.port, () => {
    console.log(`Metrics API running on http://localhost:${config.port}`);
});
