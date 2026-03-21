import { BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookGrid from "@/components/books/BookGrid";
import { Button } from "@/components/ui/button";

/**
 * Landing page — Server Component.
 * Fetches the first 20 books directly from the database for the initial render.
 * Client-side search and filtering are added in Commit 10 (BookSearch component).
 */
export default async function HomePage() {
  const books = await prisma.book.findMany({
    orderBy: { title: "asc" },
    take: 20,
    select: {
      id: true,
      title: true,
      author: true,
      genre: true,
      summary: true,
      coverUrl: true,
      totalCopies: true,
      copiesAvailable: true,
    },
  });

  const totalBooks = await prisma.book.count();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered book discovery
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your next great read
              <span className="text-primary"> awaits</span>
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground">
              Browse {totalBooks} curated books across every genre. Borrow up to 30 days,
              discover with AI, and manage your reading list — all in one place.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#books">
                  <BookOpen className="h-4 w-4" />
                  Browse books
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Create free account</Link>
              </Button>
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 pt-4 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{totalBooks}</div>
                <div>Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">30</div>
                <div>Day borrows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">AI</div>
                <div>Powered search</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book grid */}
      <section id="books" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">All Books</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {books.length} of {totalBooks} books
            </p>
          </div>
        </div>

        <BookGrid books={books} />
      </section>
    </div>
  );
}
