import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface BookCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  summary?: string | null;
  coverUrl?: string | null;
  totalCopies: number;
  copiesAvailable: number;
}

/**
 * Displays a single book as a card with cover image, title, author,
 * genre badge, and availability indicator.
 * Clicking the card navigates to the book detail page.
 */
export default function BookCard({
  id,
  title,
  author,
  genre,
  summary,
  coverUrl,
  totalCopies,
  copiesAvailable,
}: BookCardProps) {
  const available = copiesAvailable > 0;

  return (
    <Link href={`/books/${id}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        {/* Cover image */}
        <div className="relative aspect-[2/3] w-full bg-muted">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`Cover of ${title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <BookOpen className="h-12 w-12 opacity-30" />
            </div>
          )}

          {/* Availability overlay badge */}
          <div className="absolute bottom-2 left-2">
            <Badge variant={available ? "default" : "destructive"} className="text-xs">
              {available ? `${copiesAvailable}/${totalCopies} available` : "Unavailable"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-3 space-y-1">
          <Badge variant="secondary" className="text-xs">
            {genre}
          </Badge>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">{author}</p>
          {summary && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{summary}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
