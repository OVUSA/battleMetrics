/**
 * App.jsx
 * ---------------------------------------------------------
 * The root component. Its ONLY job is to:
 *   1. Pull state and actions from the usePlayerSearch hook.
 *   2. Pass them down to the right components.
 *
 * There is NO business logic here — that lives in the hook.
 * There is NO styling here — that lives in the components.
 *
 * If this file is getting long or complex, it's a signal
 * that logic has leaked in and should move to the hook.
 * ---------------------------------------------------------
 */

import "./styles/global.css";

import { usePlayerSearch } from "./hooks/usePlayerSearch";
import { PageHeader }      from "./components/PageHeader/PageHeader";
import { SearchPanel }     from "./components/SearchPanel/SearchPanel";
import { PlayerList }      from "./components/PlayerList/PlayerList";

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
