import type { SavedPlayerItem, SearchHistoryItem } from './types';

const SEARCH_HISTORY_KEY = 'metrics.searchHistory.v1';
const SAVED_PLAYERS_KEY = 'metrics.savedPlayers.v1';

const safeParse = <T>(raw: string | null): T[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadSearchHistory = (): SearchHistoryItem[] => {
  return safeParse<SearchHistoryItem>(localStorage.getItem(SEARCH_HISTORY_KEY));
};

export const saveSearchHistory = (items: SearchHistoryItem[]): void => {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
};

export const loadSavedPlayers = (): SavedPlayerItem[] => {
  return safeParse<SavedPlayerItem>(localStorage.getItem(SAVED_PLAYERS_KEY));
};

export const saveSavedPlayers = (items: SavedPlayerItem[]): void => {
  localStorage.setItem(SAVED_PLAYERS_KEY, JSON.stringify(items));
};
