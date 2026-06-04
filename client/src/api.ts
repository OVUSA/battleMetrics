import type { PlayerSessionApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const fetchPlayerSessions = async (query: string): Promise<PlayerSessionApiResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/players/sessions?query=${encodeURIComponent(query.trim())}`,
    {
      method: 'GET',
    },
  );

  const payload = (await response.json()) as PlayerSessionApiResponse | { error: string };

  if (!response.ok) {
    const message = 'error' in payload ? payload.error : 'Unable to fetch player session data.';
    throw new Error(message);
  }

  return payload as PlayerSessionApiResponse;
};
