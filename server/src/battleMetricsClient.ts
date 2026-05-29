import { config } from './config.js';

const buildHeaders = (): HeadersInit => {
  if (!config.battleMetricsApiToken) {
    return {
      Accept: 'application/json',
    };
  }

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${config.battleMetricsApiToken}`,
  };
};

const withBaseUrl = (pathOrUrl: string): string => {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  return `${config.battleMetricsBaseUrl}${pathOrUrl}`;
};

export const battleMetricsGet = async <T>(pathOrUrl: string): Promise<T> => {
  const response = await fetch(withBaseUrl(pathOrUrl), {
    method: 'GET',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`BattleMetrics request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
};
