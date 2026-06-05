"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerRouter = void 0;
const express_1 = require("express");
const playerSessionService_js_1 = require("./playerSessionService.js");
exports.playerRouter = (0, express_1.Router)();
exports.playerRouter.get('/sessions', async (req, res) => {
    const query = typeof req.query.query === 'string' ? req.query.query : '';
    if (!query.trim()) {
        res.status(400).json({ error: 'Query is required.' });
        return;
    }
    try {
        const summary = await (0, playerSessionService_js_1.getPlayerSessionSummary)(query);
        res.json({
            query,
            player: {
                id: summary.playerId,
                name: summary.playerName,
            },
            totalMinutes: summary.totalMinutes,
            totalHours: summary.totalHours,
            totalSessions: summary.totalSessions,
            totalTimePlayed: summary.totalTimePlayed,
            totalTimePlayedHours: summary.totalTimePlayedHours,
            servers: summary.servers.map((server) => ({
                ...server,
                totalHours: Number((server.totalMinutes / 60).toFixed(2)),
            })),
            serverDetails: summary.serverDetails.map((server) => ({
                ...server,
                totalHours: Number((server.timePlayed / 60).toFixed(2)),
            })),
            fetchedAt: new Date().toISOString(),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        const status = message.toLowerCase().includes('no player found') ? 404 : 502;
        res.status(status).json({ error: message });
    }
});
// request to get players session  on the server:
// $ $ curl -n https://api.battlemetrics.com/players/$PLAYER_ID/servers/$SERVER_ID
//Respond :
// {
//   "data": {
//     "type": "playerServerInformation",
//     "attributes": {
//       "firstSeen": "2015-01-01T12:00:00Z",
//       "lastSeen": "2015-01-01T12:00:00Z",
//       "timePlayed": 42,
//       "online": true
//     }
//   }
// }
//GET https://api.battlemetrics.com/sessions 
//?filter[players]={player_id}&include=server get the list of all the servers player played on
//cache the returned server_id mappings on your end.
