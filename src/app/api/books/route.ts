import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

/**
 * GET /api/books
 * Returns a paginated list of books.
 *
 * Query params:
 *   q      — full-text search across title, author, and genre
 *   genre  — exact genre filter
 *   author — partial author name filter
 *   page   — page number (1-based, default 1)
 *
 * Response: { books, total, page, pageSize, totalPages }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const genre = searchParams.get("genre")?.trim() ?? "";
  const author = searchParams.get("author")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const where = buildWhereClause(q, genre, author);

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: { title: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        author: true,
        genre: true,
        summary: true,
        coverUrl: true,
        totalCopies: true,
        copiesAvailable: true,
        publishedDate: true,
      },
    }),
    prisma.book.count({ where }),
  ]);

  return NextResponse.json({
    books,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

/**
 * POST /api/books
 * Admin-only. Creates a new book.
 * copiesAvailable is set equal to totalCopies on creation.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);

  if (!body?.title || !body?.author || !body?.genre) {
    return NextResponse.json(
      { error: "title, author, and genre are required." },
      { status: 400 }
    );
  }

  const totalCopies = Number(body.totalCopies) || 1;

  const book = await prisma.book.create({
    data: {
      title: body.title,
      author: body.author,
      genre: body.genre,
      summary: body.summary ?? null,
      isbn: body.isbn ?? null,
      coverUrl: body.coverUrl ?? null,
      publishedDate: body.publishedDate ? new Date(body.publishedDate) : null,
      totalCopies,
      copiesAvailable: totalCopies,
    },
  });

  return NextResponse.json(book, { status: 201 });
}

/**
 * Builds the Prisma where clause from the provided filter params.
 * `q` searches title, author, and genre simultaneously (OR).
 * `genre` and `author` are additional narrowing filters (AND).
 */
function buildWhereClause(q: string, genre: string, author: string) {
  const filters: object[] = [];

  if (q) {
    filters.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { genre: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (genre) {
    filters.push({ genre: { equals: genre, mode: "insensitive" } });
  }

  if (author) {
    filters.push({ author: { contains: author, mode: "insensitive" } });
  }

  return filters.length > 0 ? { AND: filters } : {};
}
