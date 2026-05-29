export interface ServerSummary {
  serverId: string;
  serverName: string;
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
}

export interface PlayerSessionApiResponse {
  query: string;
  player: {
    id: string;
    name: string;
  };
  totalMinutes: number;
  totalHours: number;
  totalSessions: number;
  servers: ServerSummary[];
  fetchedAt: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  playerId: string;
  playerName: string;
  totalHours: number;
  totalSessions: number;
  fetchedAt: string;
  servers: ServerSummary[];
}

export interface SavedPlayerItem {
  playerId: string;
  playerName: string;
  savedAt: string;
}
