import Image from "next/image";
import Link from "next/link";
import { X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem as CartItemType } from "./CartProvider";

interface CartItemProps {
  item: CartItemType;
  onRemove: (bookId: string) => void;
}

/**
 * Single row in the borrow cart showing cover thumbnail, title, author,
 * and a remove button.
 */
export default function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      {/* Cover thumbnail */}
      <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.title}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <BookOpen className="h-5 w-5 opacity-40" />
          </div>
        )}
      </div>

      {/* Book info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/books/${item.bookId}`}
          className="font-medium text-sm leading-tight hover:text-primary transition-colors line-clamp-2"
        >
          {item.title}
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {item.author}
        </p>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.bookId)}
        aria-label={`Remove ${item.title} from cart`}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
