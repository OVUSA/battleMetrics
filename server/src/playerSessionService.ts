// import fs from 'node:fs/promises';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';
import { battleMetricsGet } from './battleMetricsClient.js';
import {
  type BattleMetricsApiListResponse,
  type BattleMetricsApiSingleResponse,
  type BattleMetricsEntity,
  type PlayerServerInfo,
  type PlayerSessionSummary,
  type SessionSummaryByServer,
} from './types.js';

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

const getPlayerName = (player: BattleMetricsEntity): string => {
  const candidate = player.attributes?.name;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : `Player ${player.id}`;
};

const extractServerNameMap = (included: unknown[] | undefined): Map<string, string> => {
  const map = new Map<string, string>();

  for (const entry of included ?? []) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const entity = entry as BattleMetricsEntity;
    if (entity.type !== 'server') {
      continue;
    }

    const name = entity.attributes?.name;
    map.set(entity.id, typeof name === 'string' && name.length > 0 ? name : `Server ${entity.id}`);
  }

  return map;
};

const sessionMinutes = (startRaw: unknown, stopRaw: unknown): number => {
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

const getServerIdFromSession = (session: BattleMetricsEntity): string => {
  const relationships = session.relationships as
    | {
        server?: {
          data?: {
            id?: string;
          };
        };
      }
    | undefined;

  return relationships?.server?.data?.id ?? 'unknown';
};

const getFirstPlayerFromSearch = async (query: string): Promise<BattleMetricsEntity | null> => {
  if (ALL_DIGITS_REGEX.test(query)) {
    try {
      const playerById = await battleMetricsGet<BattleMetricsApiSingleResponse<BattleMetricsEntity>>(
        `/players/${encodeURIComponent(query)}`,
      );
      return playerById.data;
    } catch {
      // Fall back to text search when a numeric query is not a direct player id.
    }
  }

  const list = await battleMetricsGet<BattleMetricsApiListResponse<BattleMetricsEntity>>(
    `/players?filter[search]=${encodeURIComponent(query)}&page[size]=10`,
  );

  if (!list.data.length) {
    return null;
  }

  const lowerQuery = query.toLowerCase();
  return (
    list.data.find((player) => getPlayerName(player).toLowerCase() === lowerQuery) ??
    list.data.find((player) => getPlayerName(player).toLowerCase().includes(lowerQuery)) ??
    list.data[0]
  );
};

const getSessionsPage = async (url: string): Promise<BattleMetricsApiListResponse<BattleMetricsEntity>> => {
  return battleMetricsGet<BattleMetricsApiListResponse<BattleMetricsEntity>>(url);
};

type PlayerSessionsResult = {
  sessions: BattleMetricsEntity[];
  serverNameMap: Map<string, string>;
};

const mergeServerNames = (target: Map<string, string>, included: unknown[] | undefined): void => {
  for (const [id, name] of extractServerNameMap(included)) {
    if (!target.has(id)) {
      target.set(id, name);
    }
  }
};

const fetchPlayerSessions = async (playerId: string): Promise<PlayerSessionsResult> => {
  const endpoints = [
    `/sessions?filter[players]=${encodeURIComponent(playerId)}&include=server&page[size]=${SESSION_PAGE_SIZE}&sort=-start`,
    `/sessions?filter[player]=${encodeURIComponent(playerId)}&include=server&page[size]=${SESSION_PAGE_SIZE}&sort=-start`,
    `/players/${encodeURIComponent(playerId)}/relationships/sessions?include=server&page[size]=${SESSION_PAGE_SIZE}`,
  ];

  let lastError: unknown;

  for (const initialUrl of endpoints) {
    try {
      const collected: BattleMetricsEntity[] = [];
      const serverNameMap = new Map<string, string>();
      let pageCount = 0;
      let nextUrl: string | null = initialUrl;

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
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error('Unable to fetch player sessions from BattleMetrics.');
};

const summarizeSessions = (
  sessions: BattleMetricsEntity[],
  serverNameMap: Map<string, string>,
): { totalMinutes: number; totalSessions: number; servers: SessionSummaryByServer[] } => {
  const totalsByServer = new Map<string, SessionSummaryByServer>();
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

const getUniqueServerIdsFromSessions = (sessions: BattleMetricsEntity[]): string[] => {
  const ids = new Set<string>();

  for (const session of sessions) {
    const serverId = getServerIdFromSession(session);
    if (serverId && serverId !== 'unknown') {
      ids.add(serverId);
    }
  }

  return [...ids];
};

export const normalizePlayerServerInfo = (
  serverId: string,
  data: BattleMetricsEntity,
  serverNameMap: Map<string, string>,
): PlayerServerInfo => {
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
};

const fetchPlayerServerInfo = async (
  playerId: string,
  serverId: string,
  serverNameMap: Map<string, string>,
): Promise<PlayerServerInfo | null> => {
  try {
    const response = await battleMetricsGet<BattleMetricsApiSingleResponse<BattleMetricsEntity>>(
      `/players/${encodeURIComponent(playerId)}/servers/${encodeURIComponent(serverId)}`,
    );

    // await saveRawResponse(
    //   `player-${playerId}-server-${serverId}.json`,
    //   response,
    // );

    return normalizePlayerServerInfo(serverId, response.data, serverNameMap);
  } catch {
    return null;
  }
};

const fetchPlayerServerInfos = async (
  playerId: string,
  serverIds: string[],
  serverNameMap: Map<string, string>,
): Promise<PlayerServerInfo[]> => {
  if (!serverIds.length) {
    return [];
  }

  try {
    const response = await battleMetricsGet<BattleMetricsApiListResponse<BattleMetricsEntity>>(
      `/players/${encodeURIComponent(playerId)}/servers?include=server&page[size]=100`,
    );

    const bulkResults = response.data.map((entry) => normalizePlayerServerInfo(entry.id, entry, serverNameMap));
    const fetchedIds = new Set(bulkResults.map((server) => server.serverId));
    const missingIds = serverIds.filter((serverId) => !fetchedIds.has(serverId));

    if (!missingIds.length) {
      return bulkResults;
    }

    const fallbackResults = await Promise.all(
      missingIds.map((serverId) => fetchPlayerServerInfo(playerId, serverId, serverNameMap)),
    );

    return [...bulkResults, ...fallbackResults.filter((info): info is PlayerServerInfo => info !== null)];
  } catch {
    const fallbackResults = await Promise.all(
      serverIds.map((serverId) => fetchPlayerServerInfo(playerId, serverId, serverNameMap)),
    );

    return fallbackResults.filter((info): info is PlayerServerInfo => info !== null);
  }
};

const summarizeServerPlayInfo = (serverDetails: PlayerServerInfo[]) => {
  const totalTimePlayed = serverDetails.reduce((sum, server) => sum + server.timePlayed, 0);
  return {
    totalTimePlayed,
    totalTimePlayedHours: Number((totalTimePlayed / 60).toFixed(2)),
  };
};

export const getPlayerSessionSummary = async (query: string): Promise<PlayerSessionSummary> => {
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
  const serverDetails = await fetchPlayerServerInfos(playerId, serverIds, sessionResult.serverNameMap);

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
