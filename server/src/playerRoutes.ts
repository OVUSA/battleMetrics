import { Router } from 'express';
import { getPlayerSessionSummary } from './playerSessionService.js';

export const playerRouter = Router();

playerRouter.get('/sessions', async (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query : '';

  if (!query.trim()) {
    res.status(400).json({ error: 'Query is required.' });
    return;
  }

  try {
    const summary = await getPlayerSessionSummary(query);

    res.json({
      query,
      player: {
        id: summary.playerId,
        name: summary.playerName,
      },
      totalMinutes: summary.totalMinutes,
      totalHours: summary.totalHours,
      totalSessions: summary.totalSessions,
      servers: summary.servers.map((server) => ({
        ...server,
        totalHours: Number((server.totalMinutes / 60).toFixed(2)),
      })),
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error.';
    const status = message.toLowerCase().includes('no player found') ? 404 : 502;

    res.status(status).json({ error: message });
  }
});
