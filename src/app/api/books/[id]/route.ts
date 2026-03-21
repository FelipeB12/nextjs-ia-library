import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

/**
 * PUT /api/books/[id]
 * Admin-only. Updates an existing book's metadata.
 * copiesAvailable is adjusted proportionally when totalCopies changes.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!body?.title || !body?.author || !body?.genre) {
    return NextResponse.json(
      { error: "title, author, and genre are required." },
      { status: 400 }
    );
  }

  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  // Adjust copiesAvailable proportionally when totalCopies changes
  const newTotal = Number(body.totalCopies) || existing.totalCopies;
  const delta = newTotal - existing.totalCopies;
  const newAvailable = Math.max(0, existing.copiesAvailable + delta);

  const book = await prisma.book.update({
    where: { id },
    data: {
      title: body.title,
      author: body.author,
      genre: body.genre,
      summary: body.summary ?? null,
      isbn: body.isbn ?? null,
      coverUrl: body.coverUrl ?? null,
      publishedDate: body.publishedDate ? new Date(body.publishedDate) : null,
      totalCopies: newTotal,
      copiesAvailable: newAvailable,
    },
  });

  return NextResponse.json(book);
}

/**
 * DELETE /api/books/[id]
 * Admin-only. Deletes a book and all its associated orders (cascade).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  await prisma.book.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
