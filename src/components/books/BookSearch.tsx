"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import BookGrid from "./BookGrid";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookCardProps } from "./BookCard";

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
 * the book grid by fetching from GET /api/books.
 *
 * Features:
 * - Debounced text search (300 ms) across title, author, genre, and summary
 * - Genre dropdown filter
 * - Clear button to reset all filters
 * - Loading skeleton while fetching
 */
export default function BookSearch({ initialBooks, totalBooks, genres }: BookSearchProps) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [books, setBooks] = useState<BookCardProps[]>(initialBooks);
  const [total, setTotal] = useState(totalBooks);
  const [loading, setLoading] = useState(false);

  /** Fetches books from the API with the current filters. */
  const fetchBooks = useCallback(async (q: string, g: string) => {
    setLoading(true);
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

  /** Debounce the text query by 300 ms to avoid a request on every keystroke. */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks(query, genre);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, genre, fetchBooks]);

  const hasFilters = query !== "" || genre !== "";

  function clearFilters() {
    setQuery("");
    setGenre("");
  }

  return (
    <div className="space-y-6">
      {/* Search controls */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Text search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search by title, author, or keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Genre filter */}
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

      {/* Results count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {hasFilters ? "Search Results" : "All Books"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Searching…" : `${total} book${total !== 1 ? "s" : ""} found`}
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
