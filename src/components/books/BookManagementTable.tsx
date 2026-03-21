"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Package, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import BookForm, { type BookFormData } from "./BookForm";

export interface BookRow {
  id: string;
  title: string;
  author: string;
  genre: string;
  summary?: string | null;
  isbn?: string | null;
  coverUrl?: string | null;
  publishedDate?: string | null;
  totalCopies: number;
  copiesAvailable: number;
}

interface BookManagementTableProps {
  books: BookRow[];
  genres: string[];
}

type SortKey = "title" | "author" | "copiesAvailable";
type SortDir = "asc" | "desc";

/** Sort icon helper */
function SortIcon({ col, active, dir }: { col: string; active: string; dir: SortDir }) {
  if (col !== active) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
  return dir === "asc"
    ? <ArrowUp className="h-3.5 w-3.5" />
    : <ArrowDown className="h-3.5 w-3.5" />;
}

/**
 * Client Component that manages filtering, sorting, and all CRUD dialogs
 * for the admin book list.
 * - Add: opens BookForm in create mode → POST /api/books
 * - Edit: opens BookForm pre-filled → PUT /api/books/[id]
 * - Delete: opens confirmation dialog → DELETE /api/books/[id]
 */
export default function BookManagementTable({ books: initialBooks, genres }: BookManagementTableProps) {
  const [books, setBooks] = useState<BookRow[]>(initialBooks);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BookRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toast } = useToast();

  /** Toggle sort: same column flips direction; new column defaults to asc. */
  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  /** Called by BookForm after a successful create — prepends to the list. */
  function handleAdded(book: BookFormData & { id: string; copiesAvailable: number }) {
    setBooks((prev) => [book as BookRow, ...prev]);
    toast({ title: "Book added", description: `"${book.title}" is now in the library.` });
  }

  /** Called by BookForm after a successful edit — replaces the row in place. */
  function handleEdited(book: BookFormData & { id: string; copiesAvailable: number }) {
    setBooks((prev) => prev.map((b) => (b.id === book.id ? (book as BookRow) : b)));
    toast({ title: "Book updated" });
  }

  /** Deletes a book and removes it from local state. */
  async function handleDelete(bookId: string) {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed.");
      }
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast({ title: "Book deleted" });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  const filtered = useMemo(() => {
    let result = books;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    if (genre) result = result.filter((b) => b.genre === genre);
    if (inStockOnly) result = result.filter((b) => b.copiesAvailable > 0);
    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "author") cmp = a.author.localeCompare(b.author);
      else cmp = a.copiesAvailable - b.copiesAvailable;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [books, query, genre, inStockOnly, sortKey, sortDir]);

  return (
    <div className="space-y-4">
      {/* Top bar: filters + Add button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Title / author search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search title or author…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Genre filter */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-44"
          aria-label="Filter by genre"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {/* In-stock toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none whitespace-nowrap">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-input"
          />
          <Package className="h-4 w-4 text-muted-foreground" />
          In stock only
        </label>

        {/* Add book */}
        <Button onClick={() => setAddOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add book
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} of {books.length} books
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <p className="font-medium">No books match your filters</p>
          <p className="text-sm">Try adjusting the search or genre filter.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button onClick={() => handleSort("title")} className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors">
                  Title <SortIcon col="title" active={sortKey} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => handleSort("author")} className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors">
                  Author <SortIcon col="author" active={sortKey} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>
                <button onClick={() => handleSort("copiesAvailable")} className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors">
                  Available <SortIcon col="copiesAvailable" active={sortKey} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((book) => {
              const available = book.copiesAvailable > 0;
              return (
                <TableRow key={book.id}>
                  <TableCell className="max-w-[200px]">
                    <Link href={`/books/${book.id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">
                      {book.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">{book.author}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{book.genre}</Badge></TableCell>
                  <TableCell className="text-sm text-center">{book.totalCopies}</TableCell>
                  <TableCell className="text-sm text-center font-medium">{book.copiesAvailable}</TableCell>
                  <TableCell>
                    <Badge variant={available ? "default" : "destructive"}>
                      {available ? "In stock" : "Out of stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditTarget(book)} aria-label={`Edit ${book.title}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(book)} aria-label={`Delete ${book.title}`} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Add dialog */}
      <BookForm open={addOpen} onClose={() => setAddOpen(false)} onSaved={handleAdded} />

      {/* Edit dialog */}
      {editTarget && (
        <BookForm
          open={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          initial={{
            id: editTarget.id,
            title: editTarget.title,
            author: editTarget.author,
            genre: editTarget.genre,
            summary: editTarget.summary ?? "",
            isbn: editTarget.isbn ?? "",
            coverUrl: editTarget.coverUrl ?? "",
            publishedDate: editTarget.publishedDate
              ? editTarget.publishedDate.split("T")[0]
              : "",
            totalCopies: editTarget.totalCopies,
          }}
          onSaved={handleEdited}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete book?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong> will be permanently removed from the library along with all associated borrow records. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
