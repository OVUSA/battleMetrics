/**
 * components/PageHeader/PageHeader.jsx
 * ---------------------------------------------------------
 * Renders the page title, live-indicator badge, and subtitle.
 *
 * This is a PRESENTATIONAL component — it receives no props
 * and holds no state. It purely describes how the header
 * looks. If the copy needs to change, change it here.
 * ---------------------------------------------------------
 */

export function PageHeader() {
  return (
    <div style={{ textAlign: "center", marginBottom: "56px" }}>
      {/* Live indicator badge */}
      <div
        style={{
          display:      "inline-flex",
          alignItems:   "center",
          gap:          "8px",
          padding:      "4px 12px",
          background:   "var(--accent-dim)",
          border:       "1px solid rgba(99,182,255,0.2)",
          borderRadius: "999px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width:        6,
            height:       6,
            borderRadius: "50%",
            background:   "var(--accent)",
            animation:    "pulse 2s infinite",
          }}
        />
        <span
          style={{
            color:         "var(--accent)",
            fontSize:      "11px",
            fontFamily:    "var(--mono)",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Player Stats
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize:              "clamp(32px, 5vw, 52px)",
          fontWeight:            800,
          letterSpacing:         "-1.5px",
          lineHeight:            1.1,
          background:            "linear-gradient(135deg, #e8edf5 0%, #63b6ff 100%)",
          WebkitBackgroundClip:  "text",
          WebkitTextFillColor:   "transparent",
          backgroundClip:        "text",
        }}
      >
        Playtime Tracker
      </h1>

      {/* Subtitle */}
      <p
        style={{
          color:         "var(--text-secondary)",
          marginTop:     "12px",
          fontSize:      "14px",
          letterSpacing: "0.2px",
        }}
      >
        Enter an 8-digit player number to view total session time
      </p>
    </div>
  );
}
