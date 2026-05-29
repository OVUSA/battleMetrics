export interface BattleMetricsApiListResponse<TData, TIncluded = unknown> {
  data: TData[];
  included?: TIncluded[];
  links?: {
    next?: string | null;
  };
}

export interface BattleMetricsApiSingleResponse<TData> {
  data: TData;
}

export interface BattleMetricsEntity {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
}

export interface SessionSummaryByServer {
  serverId: string;
  serverName: string;
  totalMinutes: number;
  sessionCount: number;
}

export interface PlayerSessionSummary {
  playerId: string;
  playerName: string;
  totalMinutes: number;
  totalHours: number;
  totalSessions: number;
  servers: SessionSummaryByServer[];
}
