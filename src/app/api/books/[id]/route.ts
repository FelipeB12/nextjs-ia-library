import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/books/[id]
 * Returns a single book by ID with all fields.
 * Returns 404 if the book does not exist.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  if (!book) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  return NextResponse.json(book);
}
