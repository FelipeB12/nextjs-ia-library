import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BookManagementTable from "@/components/books/BookManagementTable";

export const metadata = { title: "Book Management — Library Admin" };

/**
 * Admin book management page — Server Component.
 * Fetches all books and distinct genres, passes them to the
 * BookManagementTable Client Component for filtering and sorting.
 * Add / Edit / Delete actions are wired in Commit 17.
 */
export default async function AdminBooksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const [books, genreRows] = await Promise.all([
    prisma.book.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        author: true,
        genre: true,
        totalCopies: true,
        copiesAvailable: true,
      },
    }),
    prisma.book.findMany({
      select: { genre: true },
      distinct: ["genre"],
      orderBy: { genre: "asc" },
    }),
  ]);

  const genres = genreRows.map((r: { genre: string }) => r.genre);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {books.length} books in the library
          </p>
        </div>
        {/* Add Book button — wired to BookForm dialog in Commit 17 */}
        <div id="add-book-action" />
      </div>

      <BookManagementTable books={books} genres={genres} />
    </div>
  );
}
