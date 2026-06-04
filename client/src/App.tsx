import { useState } from 'react';

import { fetchPlayerSessions } from './api';
import { loadSearchHistory, saveSearchHistory } from './storage';
import type { PlayerSessionApiResponse, SearchHistoryItem } from './types';
import './App.css';

const MAX_HISTORY_ITEMS = 50;

const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const toHistoryItem = (payload: PlayerSessionApiResponse): SearchHistoryItem => ({
  id: `${payload.player.id}-${Date.now()}`,
  query: payload.query,
  playerId: payload.player.id,
  playerName: payload.player.name,
  totalHours: payload.totalHours,
  totalSessions: payload.totalSessions,
  fetchedAt: payload.fetchedAt,
  servers: payload.servers,
});

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [latestResult, setLatestResult] = useState<SearchHistoryItem | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => loadSearchHistory());
  // const [savedPlayers, setSavedPlayers] = useState<SavedPlayerItem[]>(() => loadSavedPlayers());

  // const hasLatestResultSaved = useMemo(() => {
  //   if (!latestResult) {
  //     return false;
  //   }

  //   return savedPlayers.some((item) => item.playerId === latestResult.playerId);
  // }, [latestResult, savedPlayers]);

  const executeSearch = async (): Promise<void> => {
    const input = query.trim();
    if (!input) {
      setErrorMessage('Enter a 10-digit number or a player name.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetchPlayerSessions(input);
      const nextItem = toHistoryItem(response);

      setLatestResult(nextItem);

      setHistory((previous) => {
        const withoutCurrent = previous.filter(
          (item) => !(item.playerId === nextItem.playerId && item.query === nextItem.query),
        );
        const nextHistory = [nextItem, ...withoutCurrent].slice(0, MAX_HISTORY_ITEMS);
        saveSearchHistory(nextHistory);
        return nextHistory;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch player session data.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // const saveLatestPlayer = (): void => {
  //   if (!latestResult) {
  //     setErrorMessage('Search for a player first, then use the plus button to save.');
  //     return;
  //   }

  //   setSavedPlayers((previous) => {
  //     if (previous.some((item) => item.playerId === latestResult.playerId)) {
  //       return previous;
  //     }

  //     const nextSaved = [
  //       {
  //         playerId: latestResult.playerId,
  //         playerName: latestResult.playerName,
  //         savedAt: new Date().toISOString(),
  //       },
  //       ...previous,
  //     ];

  //     saveSavedPlayers(nextSaved);
  //     return nextSaved;
  //   });
  // };

  // const removeSavedPlayer = (playerId: string): void => {
  //   setSavedPlayers((previous) => {
  //     const nextSaved = previous.filter((item) => item.playerId !== playerId);
  //     saveSavedPlayers(nextSaved);
  //     return nextSaved;
  //   });
  // };

  return (
    <main className="app-shell">
      <section className="panel hero-panel">
        <div className="hero-head">
          <div className="live-badge">
            <span className="live-dot" aria-hidden="true"></span>
            <span className="live-text">Player Stats</span>
          </div>

          <h1 className="hero-title">Playtime Tracker</h1>

          <p className="subtitle">
            Enter a 10-digit player number or player name to view total session time across servers.
          </p>
        </div>

        <div className="search-row" role="search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void executeSearch();
              }
            }}
            placeholder="Enter player name or 10-digit id"
            aria-label="Search player"
          />

          <button type="button" className="search-btn" onClick={() => void executeSearch()} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>

        {/* <button
            type="button"
            className="plus-btn"
            onClick={saveLatestPlayer}
            disabled={!latestResult || hasLatestResultSaved}
            aria-label="Save latest searched player"
            title={hasLatestResultSaved ? 'Player is already saved' : 'Save latest searched player'}
          >
            +
          </button>  */}
        </div>

        {errorMessage ? <p className="feedback error">{errorMessage}</p> : null}
        {!errorMessage && latestResult ? (
          <p className="feedback success">
            {latestResult.playerName}: {latestResult.totalHours.toFixed(2)}h across {latestResult.totalSessions}{' '}
            sessions.
          </p>
        ) : null}
      </section>

      <section className="panel table-panel">
        <div className="panel-header">
          <h2>Search History</h2>
          <span>{history.length} players</span>
        </div>

        {history.length === 0 ? (
          <p className="empty-state">No player searches yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Player ID</th>
                  <th>Total Hours</th>
                  <th>Sessions</th>
                  <th>Top Server</th>
                  <th>Fetched</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.playerName}</strong>
                      <small>ID: {item.playerId}</small>
                    </td>
                    <td>{item.query}</td>
                    <td>{item.totalHours.toFixed(2)}h</td>
                    <td>{item.totalSessions}</td>
                    <td>{item.servers[0] ? `${item.servers[0].serverName} (${item.servers[0].totalHours}h)` : '-'}</td>
                    <td>{formatDateTime(item.fetchedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* <section className="panel table-panel">
        <div className="panel-header">
          <h2>Saved Players</h2>
          <span>{savedPlayers.length} saved</span>
        </div>

        {savedPlayers.length === 0 ? (
          <p className="empty-state">Use the plus sign to save searched players.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Player ID</th>
                  <th>Saved At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {savedPlayers.map((item) => (
                  <tr key={item.playerId}>
                    <td>{item.playerName}</td>
                    <td>{item.playerId}</td>
                    <td>{formatDateTime(item.savedAt)}</td>
                    <td>
                      <button
                        className="link-btn"
                        type="button"
                        onClick={() => removeSavedPlayer(item.playerId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section> */}
    </main>
  );
}

export default App;
