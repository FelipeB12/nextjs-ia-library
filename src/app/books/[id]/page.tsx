import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ArrowLeft, Calendar, Hash } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/books/AddToCartButton";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Book detail page — Server Component.
 * Displays all book metadata, availability, and an "Add to Borrow Cart" button.
 */
export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      author: true,
      genre: true,
      summary: true,
      isbn: true,
      publishedDate: true,
      coverUrl: true,
      totalCopies: true,
      copiesAvailable: true,
    },
  });

  if (!book) notFound();

  const available = book.copiesAvailable > 0;
  const publishedYear = book.publishedDate
    ? new Date(book.publishedDate).getFullYear()
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to books
      </Link>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[240px_1fr]">
        {/* Cover */}
        <div className="relative aspect-[2/3] w-full max-w-[240px] rounded-lg overflow-hidden bg-muted shadow-md">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              sizes="240px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <BookOpen className="h-16 w-16 opacity-20" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {/* Genre badge */}
          <div>
            <Badge variant="secondary">{book.genre}</Badge>
          </div>

          {/* Title + author */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              {book.title}
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">{book.author}</p>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            <Badge variant={available ? "default" : "destructive"}>
              {available
                ? `${book.copiesAvailable} of ${book.totalCopies} copies available`
                : "Currently unavailable"}
            </Badge>
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {publishedYear && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {publishedYear}
              </span>
            )}
            {book.isbn && (
              <span className="flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" />
                ISBN {book.isbn}
              </span>
            )}
          </div>

          {/* Summary */}
          {book.summary && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Summary
              </h2>
              <p className="text-base leading-relaxed text-foreground/80">
                {book.summary}
              </p>
            </div>
          )}

          {/* Borrow action */}
          <div className="pt-2">
            <AddToCartButton
              bookId={book.id}
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
              available={available}
            />
            {!available && (
              <p className="mt-2 text-xs text-muted-foreground">
                All copies are currently borrowed. Check back soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Dynamic metadata for the book detail page. */
export async function generateMetadata({ params }: BookPageProps) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    select: { title: true, author: true },
  });
  if (!book) return {};
  return {
    title: `${book.title} — Library`,
    description: `Borrow "${book.title}" by ${book.author}`,
  };
}
