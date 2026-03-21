"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "library_ai_api_key";

/**
 * Persists the user's Anthropic API key in sessionStorage so it is never
 * sent to the server and is cleared when the browser tab closes.
 *
 * Returns:
 *   apiKey   — current key (empty string if not set)
 *   setKey   — save a new key
 *   clearKey — remove the key
 *   isReady  — true when a non-empty key is stored
 */
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState("");

  // Hydrate from sessionStorage on mount (client only)
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY) ?? "";
    setApiKeyState(stored);
  }, []);

  const setKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      sessionStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setApiKeyState(trimmed);
  }, []);

  const clearKey = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setApiKeyState("");
  }, []);

  return { apiKey, setKey, clearKey, isReady: apiKey.length > 0 };
}
