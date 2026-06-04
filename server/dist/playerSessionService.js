// import fs from 'node:fs/promises';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';
import { battleMetricsGet } from './battleMetricsClient.js';
const MAX_SESSION_PAGES = 20;
const SESSION_PAGE_SIZE = 100;
const ALL_DIGITS_REGEX = /^\d+$/;
// const CACHE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../cache');
// const ensureCacheDir = async (): Promise<void> => {
//   await fs.mkdir(CACHE_DIR, { recursive: true });
// };
// const sanitizeFileName = (name: string): string =>
//   name
//     .replace(/[<>:"/\\|?*]/g, '_')
//     .replace(/\s+/g, '_')
//     .replace(/[^a-zA-Z0-9_\-.]/g, '_')
//     .slice(0, 200);
// const saveRawResponse = async (fileName: string, payload: unknown): Promise<void> => {
//   await ensureCacheDir();
//   const filePath = path.join(CACHE_DIR, sanitizeFileName(fileName));
//   await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
// };
const getPlayerName = (player) => {
    const candidate = player.attributes?.name;
    return typeof candidate === 'string' && candidate.length > 0 ? candidate : `Player ${player.id}`;
};
const extractServerNameMap = (included) => {
    const map = new Map();
    for (const entry of included ?? []) {
        if (!entry || typeof entry !== 'object') {
            continue;
        }
        const entity = entry;
        if (entity.type !== 'server') {
            continue;
        }
        const name = entity.attributes?.name;
        map.set(entity.id, typeof name === 'string' && name.length > 0 ? name : `Server ${entity.id}`);
    }
    return map;
};
const sessionMinutes = (startRaw, stopRaw) => {
    if (typeof startRaw !== 'string') {
        return 0;
    }
    const start = Date.parse(startRaw);
    if (Number.isNaN(start)) {
        return 0;
    }
    const stop = typeof stopRaw === 'string' ? Date.parse(stopRaw) : Date.now();
    if (Number.isNaN(stop) || stop < start) {
        return 0;
    }
    return Math.floor((stop - start) / 60000);
};
const getServerIdFromSession = (session) => {
    const relationships = session.relationships;
    return relationships?.server?.data?.id ?? 'unknown';
};
const getFirstPlayerFromSearch = async (query) => {
    if (ALL_DIGITS_REGEX.test(query)) {
        try {
            const playerById = await battleMetricsGet(`/players/${encodeURIComponent(query)}`);
            return playerById.data;
        }
        catch {
            // Fall back to text search when a numeric query is not a direct player id.
        }
    }
    const list = await battleMetricsGet(`/players?filter[search]=${encodeURIComponent(query)}&page[size]=10`);
    if (!list.data.length) {
        return null;
    }
    const lowerQuery = query.toLowerCase();
    return (list.data.find((player) => getPlayerName(player).toLowerCase() === lowerQuery) ??
        list.data.find((player) => getPlayerName(player).toLowerCase().includes(lowerQuery)) ??
        list.data[0]);
};
const getSessionsPage = async (url) => {
    return battleMetricsGet(url);
};
const mergeServerNames = (target, included) => {
    for (const [id, name] of extractServerNameMap(included)) {
        if (!target.has(id)) {
            target.set(id, name);
        }
    }
};
const fetchPlayerSessions = async (playerId) => {
    const endpoints = [
        `/sessions?filter[players]=${encodeURIComponent(playerId)}&include=server&page[size]=${SESSION_PAGE_SIZE}&sort=-start`,
        `/sessions?filter[player]=${encodeURIComponent(playerId)}&include=server&page[size]=${SESSION_PAGE_SIZE}&sort=-start`,
        `/players/${encodeURIComponent(playerId)}/relationships/sessions?include=server&page[size]=${SESSION_PAGE_SIZE}`,
    ];
    let lastError;
    for (const initialUrl of endpoints) {
        try {
            const collected = [];
            const serverNameMap = new Map();
            let pageCount = 0;
            let nextUrl = initialUrl;
            while (nextUrl && pageCount < MAX_SESSION_PAGES) {
                const response = await getSessionsPage(nextUrl);
                collected.push(...response.data);
                mergeServerNames(serverNameMap, response.included);
                // await saveRawResponse(
                //   `player-${playerId}-sessions-${pageCount + 1}-${nextUrl}.json`,
                //   response,
                // );
                nextUrl = response.links?.next ?? null;
                pageCount += 1;
            }
            return {
                sessions: collected,
                serverNameMap,
            };
        }
        catch (error) {
            lastError = error;
        }
    }
    if (lastError instanceof Error) {
        throw lastError;
    }
    throw new Error('Unable to fetch player sessions from BattleMetrics.');
};
const summarizeSessions = (sessions, serverNameMap) => {
    const totalsByServer = new Map();
    let totalMinutes = 0;
    let totalSessions = 0;
    for (const session of sessions) {
        const minutes = sessionMinutes(session.attributes?.start, session.attributes?.stop);
        if (minutes <= 0) {
            continue;
        }
        const serverId = getServerIdFromSession(session);
        if (!serverId || serverId === 'unknown') {
            continue;
        }
        const serverName = serverNameMap.get(serverId) ?? `Server ${serverId}`;
        const current = totalsByServer.get(serverId) ?? {
            serverId,
            serverName,
            totalMinutes: 0,
            sessionCount: 0,
        };
        current.totalMinutes += minutes;
        current.sessionCount += 1;
        totalsByServer.set(serverId, current);
        totalMinutes += minutes;
        totalSessions += 1;
    }
    const servers = [...totalsByServer.values()].sort((a, b) => b.totalMinutes - a.totalMinutes);
    return {
        totalMinutes,
        totalSessions,
        servers,
    };
};
const getUniqueServerIdsFromSessions = (sessions) => {
    const ids = new Set();
    for (const session of sessions) {
        const serverId = getServerIdFromSession(session);
        if (serverId && serverId !== 'unknown') {
            ids.add(serverId);
        }
    }
    return [...ids];
};
const fetchPlayerServerInfo = async (playerId, serverId, serverNameMap) => {
    try {
        const response = await battleMetricsGet(`/players/${encodeURIComponent(playerId)}/servers/${encodeURIComponent(serverId)}`);
        // await saveRawResponse(
        //   `player-${playerId}-server-${serverId}.json`,
        //   response,
        // );
        const data = response.data;
        const attributes = data.attributes ?? {};
        const timePlayedRaw = attributes.timePlayed;
        const timePlayed = typeof timePlayedRaw === 'number'
            ? timePlayedRaw
            : typeof timePlayedRaw === 'string'
                ? Number(timePlayedRaw)
                : 0;
        return {
            serverId,
            serverName: serverNameMap.get(serverId) ?? `Server ${serverId}`,
            firstSeen: typeof attributes.firstSeen === 'string' ? attributes.firstSeen : undefined,
            lastSeen: typeof attributes.lastSeen === 'string' ? attributes.lastSeen : undefined,
            timePlayed: Number.isNaN(timePlayed) ? 0 : timePlayed,
            online: typeof attributes.online === 'boolean' ? attributes.online : undefined,
        };
    }
    catch {
        return null;
    }
};
const summarizeServerPlayInfo = (serverDetails) => {
    const totalTimePlayed = serverDetails.reduce((sum, server) => sum + server.timePlayed, 0);
    return {
        totalTimePlayed,
        totalTimePlayedHours: Number((totalTimePlayed / 60).toFixed(2)),
    };
};
export const getPlayerSessionSummary = async (query) => {
    const sanitized = query.trim();
    if (!sanitized) {
        throw new Error('Search query is required.');
    }
    const player = await getFirstPlayerFromSearch(sanitized);
    if (!player) {
        throw new Error('No player found for the given query.');
    }
    const playerId = player.id;
    const playerName = getPlayerName(player);
    const sessionResult = await fetchPlayerSessions(playerId);
    const summary = summarizeSessions(sessionResult.sessions, sessionResult.serverNameMap);
    const serverIds = getUniqueServerIdsFromSessions(sessionResult.sessions);
    const serverDetails = [];
    for (const serverId of serverIds) {
        const info = await fetchPlayerServerInfo(playerId, serverId, sessionResult.serverNameMap);
        if (info) {
            serverDetails.push(info);
        }
    }
    const playInfo = summarizeServerPlayInfo(serverDetails);
    return {
        playerId,
        playerName,
        totalMinutes: summary.totalMinutes,
        totalHours: Number((summary.totalMinutes / 60).toFixed(2)),
        totalSessions: summary.totalSessions,
        servers: summary.servers,
        serverDetails,
        totalTimePlayed: playInfo.totalTimePlayed,
        totalTimePlayedHours: playInfo.totalTimePlayedHours,
    };
};
