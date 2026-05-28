/**
 * components/PlayerCard/PlayerCard.jsx
 * ---------------------------------------------------------
 * Displays one player's summary: number badge, name,
 * session count, total time, and a toggle for the drawer.
 *
 * PROPS:
 *   player  {Player}   The player object from the API.
 *   isNew   {boolean}  True only for the most recently added
 *                      player — triggers the slide-in animation.
 *
 * STATE:
 *   isOpen  {boolean}  Whether the session drawer is expanded.
 *                      Local to this card — each card remembers
 *                      its own open/closed state independently.
 * ---------------------------------------------------------
 */

import { useState } from "react";
import { formatTime }     from "../../utils/formatTime";
import { SessionDrawer }  from "./SessionDrawer";

/**
 * @param {{
 *   player: import('../../api/playerApi').Player,
 *   isNew:  boolean,
 * }} props
 */
export function PlayerCard({ player, isNew }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen((prev) => !prev);

  return (
    <div
      style={{
        background:   "var(--card-bg)",
        border:       "1px solid var(--border)",
        borderRadius: "12px",
        overflow:     "hidden",
        // Only animate when first added to the list
        animation:    isNew ? "cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
        transition:   "box-shadow 0.2s",
        boxShadow:    isOpen ? "0 4px 24px rgba(99,182,255,0.08)" : "none",
      }}
    >
      {/* Clickable summary row */}
      <PlayerCardHeader
        player={player}
        isOpen={isOpen}
        onClick={toggleDrawer}
      />

      {/* Collapsible session details */}
      <div
        style={{
          paddingLeft:   "80px",
          paddingRight:  "20px",
          paddingBottom: isOpen ? "12px" : 0,
        }}
      >
        <SessionDrawer sessions={player.sessions} isOpen={isOpen} />
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

/**
 * The always-visible top row of the card.
 * Acts as the toggle button for the drawer.
 */
function PlayerCardHeader({ player, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={isOpen}
      style={{
        width:      "100%",
        background: "none",
        border:     "none",
        cursor:     "pointer",
        padding:    "16px 20px",
        display:    "flex",
        alignItems: "center",
        gap:        "16px",
        textAlign:  "left",
      }}
    >
      <PlayerNumberBadge playerNumber={player.playerNumber} />
      <PlayerInfo name={player.name} sessionCount={player.sessions.length} />
      <TotalTime totalSeconds={player.totalSeconds} />
      <ExpandIcon isOpen={isOpen} />
    </button>
  );
}

/** The blue number badge on the left of each card. */
function PlayerNumberBadge({ playerNumber }) {
  return (
    <div
      style={{
        minWidth:       44,
        height:         44,
        borderRadius:   "10px",
        background:     "linear-gradient(135deg, var(--accent-dim) 0%, rgba(99,182,255,0.08) 100%)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        border:         "1px solid var(--accent-dim)",
      }}
    >
      {/* Split into two rows of 4 digits for readability */}
      <span
        style={{
          color:         "var(--accent)",
          fontSize:      "10px",
          fontFamily:    "var(--mono)",
          letterSpacing: "0.5px",
          lineHeight:    1.5,
        }}
      >
        #{playerNumber.slice(0, 4)}
        <br />
        <span style={{ opacity: 0.7 }}>{playerNumber.slice(4)}</span>
      </span>
    </div>
  );
}

/** Player name and session count. */
function PlayerInfo({ name, sessionCount }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          color:         "var(--text-primary)",
          fontSize:      "15px",
          fontWeight:    600,
          letterSpacing: "-0.2px",
          fontFamily:    "var(--display)",
        }}
      >
        {name}
      </div>
      <div
        style={{
          color:      "var(--text-secondary)",
          fontSize:   "12px",
          marginTop:  "2px",
          fontFamily: "var(--mono)",
        }}
      >
        {sessionCount} session{sessionCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

/** Total playtime aligned to the right. */
function TotalTime({ totalSeconds }) {
  return (
    <div style={{ textAlign: "right", marginRight: "12px" }}>
      <div
        style={{
          color:         "var(--accent)",
          fontSize:      "18px",
          fontWeight:    700,
          fontFamily:    "var(--mono)",
          letterSpacing: "-0.5px",
        }}
      >
        {formatTime(totalSeconds)}
      </div>
      <div
        style={{
          color:         "var(--text-muted)",
          fontSize:      "10px",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        total
      </div>
    </div>
  );
}

/** The rotating "+" icon that indicates drawer state. */
function ExpandIcon({ isOpen }) {
  return (
    <div
      style={{
        width:          28,
        height:         28,
        borderRadius:   "50%",
        border:         "1px solid var(--border)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        color:          "var(--accent)",
        fontSize:       "18px",
        fontWeight:     300,
        transition:     "transform 0.25s, background 0.2s",
        transform:      isOpen ? "rotate(45deg)" : "rotate(0deg)",
        background:     isOpen ? "var(--accent-dim)" : "transparent",
        flexShrink:     0,
      }}
    >
      +
    </div>
  );
}
