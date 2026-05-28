/**
 * App.jsx
 * ---------------------------------------------------------
 * The root component. Its ONLY job is to:
 *   1. Pull state and actions from the usePlayerSearch hook.
 *   2. Pass them down to the right components.
 * ---------------------------------------------------------
 */

import "./styles/global.css";

import { usePlayerSearch } from "./hooks/usePlayerSearch";
import { PageHeader }      from "./components/PageHeader";
import { SearchPanel }     from "./components/SearchPanel";
import { PlayerList }      from "./components/PlayerList";

export default function App() {
  const {
    players,
    latestId,
    isLoading,
    error,
    inputValue,
    inputRef,
    setInputValue,
    clearError,
    search,
    clearAll,
  } = usePlayerSearch();

  // When the user types, update the value and clear any stale error
  const handleInputChange = (value) => {
    clearError();
    setInputValue(value);
  };

  return (
    <div
      style={{
        minHeight:      "100vh",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        padding:        "60px 24px 80px",
      }}
    >
      <PageHeader />

      <SearchPanel
        inputValue={inputValue}
        inputRef={inputRef}
        isLoading={isLoading}
        error={error}
        onInputChange={handleInputChange}
        onSearch={search}
      />

      <PlayerList
        players={players}
        latestId={latestId}
        onClearAll={clearAll}
      />
    </div>
  );
}
