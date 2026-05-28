/**
 * components/PlayerCard/SessionDrawer.jsx
 * ---------------------------------------------------------
 * Animated collapsible list of individual session durations.
 * Shown inside a PlayerCard when the user clicks "+".
 *
 * PROPS:
 *   sessions {number[]}  Array of session durations in seconds.
 *   isOpen   {boolean}   Controls open/closed state.
 * ---------------------------------------------------------
 */

import { formatTime } from "../../utils/formatTime";

/**
 * @param {{ sessions: number[], isOpen: boolean }} props
 */
export function SessionDrawer({ sessions, isOpen }) {
  // Each session row is 44px tall; add 24px padding at the bottom.
  // This gives CSS something concrete to animate to (max-height trick).
  const expandedHeight = `${sessions.length * 44 + 24}px`;

  return (
    <div
      style={{
        maxHeight:  isOpen ? expandedHeight : "0",
        overflow:   "hidden",
        transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div style={{ padding: "8px 0 4px 0" }}>
        {sessions.map((durationSeconds, index) => (
          <SessionRow
            key={index}
            index={index}
            durationSeconds={durationSeconds}
            isVisible={isOpen}
          />
        ))}
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────

/**
 * A single row showing one session's number and duration.
 *
 * @param {{
 *   index:           number,
 *   durationSeconds: number,
 *   isVisible:       boolean,
 * }} props
 */
function SessionRow({ index, durationSeconds, isVisible }) {
  // Stagger each row's animation by 40ms so they cascade in
  const animationDelay = `${index * 0.04}s`;

  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          "12px",
        padding:      "8px 16px",
        borderLeft:   "2px solid var(--accent)",
        marginLeft:   "8px",
        marginBottom: "4px",
        background:   "rgba(99,182,255,0.04)",
        borderRadius: "0 6px 6px 0",
        animation:    isVisible
          ? `fadeSlide 0.2s ease ${animationDelay} both`
          : "none",
      }}
    >
      <span
        style={{
          color:      "var(--accent)",
          fontSize:   "11px",
          fontFamily: "var(--mono)",
          minWidth:   64,
        }}
      >
        Session {String(index + 1).padStart(2, "0")}
      </span>

      <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
        {formatTime(durationSeconds)}
      </span>
    </div>
  );
}
