"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "library_ai_api_key";
const KEY_CHANGE_EVENT = "library_ai_key_change";

/**
 * Persists the user's OpenAI API key in sessionStorage so it is never
 * sent to the server and is cleared when the browser tab closes.
 *
 * Broadcasts a custom window event on every change so that all mounted
 * instances of this hook (e.g. Navbar + BookSearch) stay in sync.
 *
 * Returns:
 *   apiKey   — current key (empty string if not set)
 *   setKey   — save a new key
 *   clearKey — remove the key
 *   isReady  — true when a non-empty key is stored
 */
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState("");

  useEffect(() => {
    // Hydrate from sessionStorage on mount (client only)
    setApiKeyState(sessionStorage.getItem(STORAGE_KEY) ?? "");

    // Re-sync when another instance of this hook calls setKey/clearKey
    function onKeyChange() {
      setApiKeyState(sessionStorage.getItem(STORAGE_KEY) ?? "");
    }
    window.addEventListener(KEY_CHANGE_EVENT, onKeyChange);
    return () => window.removeEventListener(KEY_CHANGE_EVENT, onKeyChange);
  }, []);

  const setKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      sessionStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setApiKeyState(trimmed);
    window.dispatchEvent(new Event(KEY_CHANGE_EVENT));
  }, []);

  const clearKey = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setApiKeyState("");
    window.dispatchEvent(new Event(KEY_CHANGE_EVENT));
  }, []);

  return { apiKey, setKey, clearKey, isReady: apiKey.length > 0 };
}
