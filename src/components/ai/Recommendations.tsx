"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, BookOpen, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiKey } from "@/hooks/useApiKey";

interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  summary?: string | null;
  coverUrl?: string | null;
  copiesAvailable: number;
}

interface RecommendationsProps {
  /** IDs of the books the user just checked out */
  bookIds: string[];
  /** The current user's ID — used to exclude already-borrowed books */
  userId: string;
  /** Called when the user dismisses the panel */
  onDismiss: () => void;
}

/**
 * Post-checkout recommendation panel.
 * Fetches from POST /api/ai/recommend (hybrid DB + optional LLM ranking).
 * Shown in a modal overlay after a successful borrow request.
 */
export default function Recommendations({ bookIds, userId, onDismiss }: RecommendationsProps) {
  const { apiKey } = useApiKey();
  const [books, setBooks] = useState<RecommendedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "X-API-Key": apiKey } : {}),
          },
          body: JSON.stringify({ bookIds, userId }),
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setBooks(data.recommendations ?? []);
      } catch {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [bookIds, userId, apiKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-background shadow-2xl p-6 space-y-5">
        {/* Close */}
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss recommendations"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {apiKey ? "AI Recommendations" : "You might also enjoy"}
            </p>
            <p className="text-xs text-muted-foreground">
              {apiKey ? "Picked by Claude based on your choices" : "Based on your borrow history"}
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-16 w-11 rounded bg-muted shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-1/4 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm text-center">
            <BookOpen className="h-8 w-8 opacity-30" />
            <p>No recommendations available right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                onClick={onDismiss}
                className="flex gap-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 p-2 transition-colors group"
              >
                {/* Cover */}
                <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-4 w-4 text-muted-foreground opacity-40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {book.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {book.genre}
                    </Badge>
                    {book.copiesAvailable > 0 ? (
                      <span className="text-[10px] text-green-600 font-medium">Available</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Out of stock</span>
                    )}
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" onClick={onDismiss}>
            Go to dashboard
          </Button>
          <Button size="sm" className="flex-1" asChild>
            <Link href="/">Browse more</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
