import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders
 * Returns orders for the currently authenticated user.
 * Admins receive all orders; customers receive only their own.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const where =
    session.user.role === "ADMIN" ? {} : { userId: session.user.id };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          genre: true,
          coverUrl: true,
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(orders);
}

/**
 * POST /api/orders
 * Creates PENDING borrow orders for each bookId in the request body.
 * Validates that each book has at least one copy available before creating the order.
 * Returns 207 (Multi-Status) with per-book success/failure results.
 *
 * Body: { bookIds: string[] }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.bookIds) || body.bookIds.length === 0) {
    return NextResponse.json(
      { error: "bookIds must be a non-empty array." },
      { status: 400 }
    );
  }

  const bookIds: string[] = body.bookIds;
  const userId = session.user.id;

  const results = await Promise.all(
    bookIds.map(async (bookId) => {
      try {
        // Verify book exists and has copies available
        const book = await prisma.book.findUnique({
          where: { id: bookId },
          select: { id: true, title: true, copiesAvailable: true },
        });

        if (!book) {
          return { bookId, success: false, error: "Book not found." };
        }

        if (book.copiesAvailable <= 0) {
          return {
            bookId,
            success: false,
            error: `"${book.title}" has no copies available.`,
          };
        }

        // Check the user doesn't already have an active order for this book
        const existing = await prisma.order.findFirst({
          where: {
            userId,
            bookId,
            status: { in: ["PENDING", "APPROVED"] },
          },
        });

        if (existing) {
          return {
            bookId,
            success: false,
            error: `You already have an active borrow for "${book.title}".`,
          };
        }

        const order = await prisma.order.create({
          data: { userId, bookId, status: "PENDING" },
        });

        return { bookId, success: true, orderId: order.id };
      } catch {
        return { bookId, success: false, error: "Unexpected error." };
      }
    })
  );

  const allSucceeded = results.every((r) => r.success);
  const status = allSucceeded ? 201 : 207;

  return NextResponse.json({ results }, { status });
}
