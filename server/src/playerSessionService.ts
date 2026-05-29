import { battleMetricsGet } from './battleMetricsClient.js';
import {
  type BattleMetricsApiListResponse,
  type BattleMetricsApiSingleResponse,
  type BattleMetricsEntity,
  type PlayerSessionSummary,
  type SessionSummaryByServer,
} from './types.js';

const MAX_SESSION_PAGES = 20;
const SESSION_PAGE_SIZE = 100;
const TEN_DIGITS_REGEX = /^\d{10}$/;

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
  if (TEN_DIGITS_REGEX.test(query)) {
    try {
      const playerById = await battleMetricsGet<BattleMetricsApiSingleResponse<BattleMetricsEntity>>(
        `/players/${encodeURIComponent(query)}`,
      );
      return playerById.data;
    } catch {
      // Fall back to text search when a 10-digit query is not a direct player id.
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

const fetchPlayerSessions = async (playerId: string): Promise<BattleMetricsEntity[]> => {
  const endpoints = [
    `/sessions?filter[player]=${encodeURIComponent(playerId)}&include=server&page[size]=${SESSION_PAGE_SIZE}&sort=-start`,
    `/players/${encodeURIComponent(playerId)}/relationships/sessions?include=server&page[size]=${SESSION_PAGE_SIZE}&sort=-start`,
  ];

  let lastError: unknown;

  for (const initialUrl of endpoints) {
    try {
      const collected: BattleMetricsEntity[] = [];
      let pageCount = 0;
      let nextUrl: string | null = initialUrl;

      while (nextUrl && pageCount < MAX_SESSION_PAGES) {
        const response = await getSessionsPage(nextUrl);
        collected.push(...response.data);

        nextUrl = response.links?.next ?? null;
        pageCount += 1;
      }

      return collected;
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

  const firstPage = await getSessionsPage(
    `/sessions?filter[player]=${encodeURIComponent(playerId)}&include=server&page[size]=${SESSION_PAGE_SIZE}&sort=-start`,
  ).catch(() => null);

  const sessions = firstPage?.data?.length ? await fetchPlayerSessions(playerId) : await fetchPlayerSessions(playerId);
  const serverNameMap = extractServerNameMap(firstPage?.included);

  const summary = summarizeSessions(sessions, serverNameMap);

  return {
    playerId,
    playerName,
    totalMinutes: summary.totalMinutes,
    totalHours: Number((summary.totalMinutes / 60).toFixed(2)),
    totalSessions: summary.totalSessions,
    servers: summary.servers,
  };
};
