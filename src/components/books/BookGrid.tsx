import BookCard, { type BookCardProps } from "./BookCard";

interface BookGridProps {
  books: BookCardProps[];
}

/**
 * Renders a responsive grid of BookCards.
 * Shows an empty state message when the books array is empty.
 */
export default function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">No books found</p>
        <p className="text-sm mt-1">Try a different search or browse all genres.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {books.map((book) => (
        <BookCard key={book.id} {...book} />
      ))}
    </div>
  );
}
