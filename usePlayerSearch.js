/**
 * hooks/usePlayerSearch.js
 * ---------------------------------------------------------
 * Custom React hook that owns ALL state and logic for
 * searching players and maintaining the results list.
 *
 * WHY A CUSTOM HOOK?
 *   Components should only handle rendering (what things
 *   look like). Business logic — "what happens when you
 *   search", "how do we prevent duplicates" — lives here.
 *
 *   This means:
 *     - Components are easy to read (no logic clutter).
 *     - Logic is easy to test without mounting any UI.
 *     - Logic can be reused by multiple components.
 *
 * USAGE:
 *   const { players, latestId, search, clearAll } =
 *     usePlayerSearch();
 * ---------------------------------------------------------
 */

import { useState, useRef } from "react";
import { getPlayer }          from "../api/playerApi";
import { validatePlayerNumber } from "../utils/validation";

/**
 * @returns {{
 *   players:    import('../api/playerApi').Player[],
 *   latestId:   string | null,
 *   isLoading:  boolean,
 *   error:      string,
 *   inputValue: string,
 *   inputRef:   React.RefObject<HTMLInputElement>,
 *   setInputValue: (value: string) => void,
 *   clearError:    () => void,
 *   search:        () => Promise<void>,
 *   clearAll:      () => void,
 * }}
 */
export function usePlayerSearch() {
  const [players,    setPlayers]    = useState([]);
  const [latestId,   setLatestId]   = useState(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState("");
  const [inputValue, setInputValue] = useState("");

  // A ref lets us focus the input after a successful search
  // without causing a re-render
  const inputRef = useRef(null);

  /**
   * Validates the current input, calls the API, and adds
   * the player to the top of the results list.
   * Sets error state if anything goes wrong.
   */
  const search = async () => {
    // 1. Validate the input before touching the API
    const validationError = validatePlayerNumber(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 2. Prevent adding the same player twice
    const alreadyInList = players.some(
      (p) => p.playerNumber === inputValue.trim()
    );
    if (alreadyInList) {
      setError("Player already in the list.");
      return;
    }

    // 3. Fetch from API
    setError("");
    setIsLoading(true);

    try {
      const player = await getPlayer(inputValue.trim());

      // Prepend so the newest result appears at the top
      setPlayers((prev) => [player, ...prev]);
      setLatestId(player.playerNumber);
      setInputValue("");
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      // Always runs — clears the spinner whether success or fail
      setIsLoading(false);
    }
  };

  /** Resets the entire results list. */
  const clearAll = () => {
    setPlayers([]);
    setLatestId(null);
  };

  return {
    players,
    latestId,
    isLoading,
    error,
    inputValue,
    inputRef,
    setInputValue,
    clearError: () => setError(""),
    search,
    clearAll,
  };
}
