/**
 * components/PlayerList/PlayerList.jsx
 * ---------------------------------------------------------
 * Renders the list of PlayerCards with a header showing
 * result count and a "Clear all" button.
 *
 * Shows an empty-state message when no players are loaded.
 *
 * PROPS:
 *   players   {Player[]}           All players fetched so far.
 *   latestId  {string | null}      ID of the most recently added
 *                                   player (for enter animation).
 *   onClearAll () => void           Called when "Clear all" clicked.
 * ---------------------------------------------------------
 */

import { PlayerCard } from "../PlayerCard/PlayerCard";

/**
 * @param {{
 *   players:    import('../../api/playerApi').Player[],
 *   latestId:   string | null,
 *   onClearAll: () => void,
 * }} props
 */
export function PlayerList({ players, latestId, onClearAll }) {
  if (players.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={{ width: "100%", maxWidth: "560px" }}>
      <ListHeader count={players.length} onClearAll={onClearAll} />

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {players.map((player) => (
          <PlayerCard
            key={player.playerNumber}
            player={player}
            isNew={player.playerNumber === latestId}
          />
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

/** Header row showing result count and clear-all button. */
function ListHeader({ count, onClearAll }) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        marginBottom:   "16px",
        paddingBottom:  "12px",
        borderBottom:   "1px solid var(--border)",
      }}
    >
      <span
        style={{
          color:         "var(--text-secondary)",
          fontSize:      "11px",
          fontFamily:    "var(--mono)",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        {count} player{count !== 1 ? "s" : ""} found
      </span>

      <button
        onClick={onClearAll}
        style={{
          background:    "none",
          border:        "none",
          color:         "var(--text-muted)",
          fontSize:      "11px",
          fontFamily:    "var(--mono)",
          cursor:        "pointer",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Clear all ×
      </button>
    </div>
  );
}

/** Shown when no players have been searched yet. */
function EmptyState() {
  return (
    <div
      style={{
        textAlign:  "center",
        color:      "var(--text-muted)",
        fontSize:   "13px",
        marginTop:  "20px",
        fontFamily: "var(--mono)",
      }}
    >
      Search a player to see results here
    </div>
  );
}
