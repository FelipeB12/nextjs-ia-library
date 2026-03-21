"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export interface BookRow {
  id: string;
  title: string;
  author: string;
  genre: string;
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
 * Client Component that manages all filtering and sorting for the admin book list.
 * Receives the full book list from the Server Component and filters/sorts in-memory
 * (100 books fits comfortably client-side without extra API calls).
 */
export default function BookManagementTable({ books, genres }: BookManagementTableProps) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /** Toggle sort: same column flips direction; new column defaults to asc. */
  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    let result = books;

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }

    if (genre) {
      result = result.filter((b) => b.genre === genre);
    }

    if (inStockOnly) {
      result = result.filter((b) => b.copiesAvailable > 0);
    }

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
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
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
          className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-48"
          aria-label="Filter by genre"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {/* In-stock toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-input"
          />
          <Package className="h-4 w-4 text-muted-foreground" />
          In stock only
        </label>
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
              {/* Sortable: title */}
              <TableHead>
                <button
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
                >
                  Title
                  <SortIcon col="title" active={sortKey} dir={sortDir} />
                </button>
              </TableHead>

              {/* Sortable: author */}
              <TableHead>
                <button
                  onClick={() => handleSort("author")}
                  className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
                >
                  Author
                  <SortIcon col="author" active={sortKey} dir={sortDir} />
                </button>
              </TableHead>

              <TableHead>Genre</TableHead>
              <TableHead>Total</TableHead>

              {/* Sortable: availability */}
              <TableHead>
                <button
                  onClick={() => handleSort("copiesAvailable")}
                  className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
                >
                  Available
                  <SortIcon col="copiesAvailable" active={sortKey} dir={sortDir} />
                </button>
              </TableHead>

              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((book) => {
              const available = book.copiesAvailable > 0;
              return (
                <TableRow key={book.id}>
                  <TableCell className="max-w-[220px]">
                    <Link
                      href={`/books/${book.id}`}
                      className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                    >
                      {book.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                    {book.author}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-center">{book.totalCopies}</TableCell>
                  <TableCell className="text-sm text-center font-medium">
                    {book.copiesAvailable}
                  </TableCell>
                  <TableCell>
                    <Badge variant={available ? "default" : "destructive"}>
                      {available ? "In stock" : "Out of stock"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
