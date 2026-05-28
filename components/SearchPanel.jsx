/**
 * components/SearchPanel/SearchPanel.jsx
 * ---------------------------------------------------------
 * The search form: player-number input, digit progress bar,
 * search button, and inline error message.
 *
 * This is a CONTROLLED component — it owns no state.
 * All values and callbacks come in as props from the parent
 * (App.jsx via the usePlayerSearch hook).
 *
 * PROPS:
 *   inputValue   {string}                 Current input text.
 *   inputRef     {React.RefObject}        Ref so hook can focus.
 *   isLoading    {boolean}               Shows spinner on button.
 *   error        {string}                Error message to display.
 *   onInputChange(value: string) => void Called on every keypress.
 *   onSearch     () => void              Called on button click / Enter.
 * ---------------------------------------------------------
 */

/** Number of digits a valid player number must have. */
const REQUIRED_DIGITS = 8;

/**
 * @param {{
 *   inputValue:    string,
 *   inputRef:      React.RefObject<HTMLInputElement>,
 *   isLoading:     boolean,
 *   error:         string,
 *   onInputChange: (value: string) => void,
 *   onSearch:      () => void,
 * }} props
 */
export function SearchPanel({
  inputValue,
  inputRef,
  isLoading,
  error,
  onInputChange,
  onSearch,
}) {
  const isReady = inputValue.length === REQUIRED_DIGITS && !isLoading;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch();
  };

  // Allow only numeric characters as the user types
  const handleChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, REQUIRED_DIGITS);
    onInputChange(digitsOnly);
  };

  return (
    <div style={{ width: "100%", maxWidth: "560px", marginBottom: "40px" }}>
      <div
        style={{
          background:   "var(--surface)",
          border:       "1px solid var(--border)",
          borderRadius: "16px",
          padding:      "24px",
          animation:    "glow 4s ease-in-out infinite",
        }}
      >
        {/* Field label */}
        <label
          style={{
            display:       "block",
            color:         "var(--text-secondary)",
            fontSize:      "11px",
            fontFamily:    "var(--mono)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom:  "10px",
          }}
        >
          Player Number
        </label>

        {/* Input row */}
        <div style={{ display: "flex", gap: "10px" }}>
          <PlayerNumberInput
            inputRef={inputRef}
            value={inputValue}
            hasError={!!error}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <SearchButton isReady={isReady} isLoading={isLoading} onClick={onSearch} />
        </div>

        {/* Digit progress bar */}
        <DigitProgressBar filledCount={inputValue.length} total={REQUIRED_DIGITS} />

        {/* Error message */}
        {error && <ErrorMessage message={error} />}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────
// These are small, focused pieces only used by SearchPanel.
// Keeping them in the same file is fine at this scale —
// extract to their own files if they grow.

function PlayerNumberInput({ inputRef, value, hasError, onChange, onKeyDown }) {
  const borderColor = hasError
    ? "var(--error)"
    : value.length === 8
    ? "rgba(99,182,255,0.4)"
    : "var(--border)";

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="\d{8}"
      maxLength={8}
      value={value}
      placeholder="00000000"
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{
        flex:          1,
        background:    "var(--bg)",
        border:        `1px solid ${borderColor}`,
        borderRadius:  "10px",
        padding:       "12px 16px",
        color:         "var(--text-primary)",
        fontSize:      "20px",
        fontFamily:    "var(--mono)",
        fontWeight:    700,
        letterSpacing: "4px",
        outline:       "none",
        transition:    "border-color 0.2s",
        caretColor:    "var(--accent)",
      }}
    />
  );
}

function SearchButton({ isReady, isLoading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!isReady}
      style={{
        padding:       "12px 24px",
        borderRadius:  "10px",
        border:        "none",
        background:    isReady
          ? "linear-gradient(135deg, #63b6ff 0%, #3d8fd4 100%)"
          : "rgba(99,182,255,0.08)",
        color:         isReady ? "#0a0c0f" : "var(--text-muted)",
        fontSize:      "13px",
        fontWeight:    700,
        fontFamily:    "var(--display)",
        letterSpacing: "0.5px",
        cursor:        isReady ? "pointer" : "not-allowed",
        transition:    "all 0.2s",
        display:       "flex",
        alignItems:    "center",
        gap:           "8px",
        whiteSpace:    "nowrap",
      }}
    >
      {isLoading ? <LoadingSpinner /> : "Search →"}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <>
      <div
        style={{
          width:        14,
          height:       14,
          border:       "2px solid rgba(99,182,255,0.3)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
          animation:    "spin 0.7s linear infinite",
        }}
      />
      Searching
    </>
  );
}

function DigitProgressBar({ filledCount, total }) {
  return (
    <div style={{ marginTop: "10px", display: "flex", gap: "4px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex:         1,
            height:       3,
            borderRadius: "999px",
            background:   i < filledCount ? "var(--accent)" : "var(--border)",
            transition:   "background 0.15s",
          }}
        />
      ))}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div
      style={{
        marginTop:  "10px",
        color:      "var(--error)",
        fontSize:   "12px",
        fontFamily: "var(--mono)",
        display:    "flex",
        alignItems: "center",
        gap:        "6px",
      }}
    >
      <span>⚠</span> {message}
    </div>
  );
}
