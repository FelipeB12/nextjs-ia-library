"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Sparkles, TriangleAlert } from "lucide-react";
import BookGrid from "./BookGrid";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookCardProps } from "./BookCard";
import { useApiKey } from "@/hooks/useApiKey";

interface BookSearchProps {
  /** Initial books rendered by the Server Component — shown before any search. */
  initialBooks: BookCardProps[];
  /** Total book count for display purposes. */
  totalBooks: number;
  /** Distinct genre values from the database, used to populate the genre filter. */
  genres: string[];
}

/**
 * Client Component that manages search state and dynamically updates
 * the book grid by fetching from GET /api/books (standard) or
 * POST /api/ai/search (AI natural language search).
 *
 * Features:
 * - Toggle between Standard Search and AI Search
 * - Debounced standard search (300 ms) across title, author, genre, and summary
 * - Genre dropdown filter (standard mode only)
 * - Natural language AI search using the user's Anthropic API key
 * - Graceful fallback when no API key is set
 */
export default function BookSearch({ initialBooks, totalBooks, genres }: BookSearchProps) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [books, setBooks] = useState<BookCardProps[]>(initialBooks);
  const [total, setTotal] = useState(totalBooks);
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiError, setAiError] = useState("");

  const { apiKey, isReady } = useApiKey();

  /** Fetches books from the standard API with the current filters. */
  const fetchBooks = useCallback(async (q: string, g: string) => {
    setLoading(true);
    setAiError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (g) params.set("genre", g);

      const res = await fetch(`/api/books?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setBooks(data.books);
      setTotal(data.total);
    } catch {
      // Keep previous results on error — error UI added in Commit 22
    } finally {
      setLoading(false);
    }
  }, []);

  /** Sends a natural language query to the AI search endpoint. */
  const fetchAiBooks = useCallback(async (q: string) => {
    if (!q.trim()) {
      setBooks(initialBooks);
      setTotal(totalBooks);
      return;
    }
    setLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "AI search failed.");
      }
      setBooks(data.books);
      setTotal(data.books.length);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI search failed.");
      setBooks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [apiKey, initialBooks, totalBooks]);

  /** Debounce standard search by 300 ms. */
  useEffect(() => {
    if (aiMode) return;
    const timer = setTimeout(() => {
      fetchBooks(query, genre);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, genre, fetchBooks, aiMode]);

  /** Debounce AI search by 600 ms (heavier operation). */
  useEffect(() => {
    if (!aiMode) return;
    const timer = setTimeout(() => {
      fetchAiBooks(query);
    }, 600);
    return () => clearTimeout(timer);
  }, [query, fetchAiBooks, aiMode]);

  /** Reset results when switching modes. */
  function toggleMode() {
    setAiMode((prev) => !prev);
    setQuery("");
    setGenre("");
    setAiError("");
    setBooks(initialBooks);
    setTotal(totalBooks);
  }

  const hasFilters = query !== "" || genre !== "";

  function clearFilters() {
    setQuery("");
    setGenre("");
    setAiError("");
    setBooks(initialBooks);
    setTotal(totalBooks);
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => !aiMode || toggleMode()}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !aiMode
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="h-3 w-3" />
          Standard
        </button>
        <button
          onClick={() => aiMode || toggleMode()}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            aiMode
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          AI Search
          {!isReady && (
            <span className="ml-0.5 opacity-60">(key required)</span>
          )}
        </button>
      </div>

      {/* AI key warning */}
      {aiMode && !isReady && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Set your Anthropic API key using the <strong>AI Key</strong> button in the
            navbar to use natural language search.
          </span>
        </div>
      )}

      {/* Search controls */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Text search */}
        <div className="relative flex-1">
          {aiMode ? (
            <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          ) : (
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          )}
          <input
            type="search"
            placeholder={
              aiMode
                ? "Describe what you're looking for… (e.g. 'dystopian novels about AI')"
                : "Search by title, author, or keyword…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={aiMode && !isReady}
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Genre filter — standard mode only */}
        {!aiMode && (
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-48"
            aria-label="Filter by genre"
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* AI error */}
      {aiError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {hasFilters ? (aiMode ? "AI Results" : "Search Results") : "All Books"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? aiMode
                ? "Asking Claude…"
                : "Searching…"
              : `${total} book${total !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      {/* Book grid or loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <BookGrid books={books} />
      )}
    </div>
  );
}
