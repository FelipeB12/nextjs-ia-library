import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/generated/prisma/client";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

/**
 * PATCH /api/orders/[id]
 * Admin-only endpoint to update an order's status.
 *
 * Body: { action: "APPROVE" | "RETURN" | "REJECT" }
 *
 * APPROVE — validates order is PENDING and book has copies available,
 *            then atomically sets status=APPROVED, approvedAt, dueDate (+30 days),
 *            and decrements book.copiesAvailable.
 *
 * RETURN  — validates order is APPROVED, then atomically sets status=RETURNED,
 *            returnedAt, and increments book.copiesAvailable.
 *
 * REJECT  — validates order is PENDING, sets status=REJECTED.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action = body?.action as string | undefined;

  if (!action || !["APPROVE", "RETURN", "REJECT"].includes(action)) {
    return NextResponse.json(
      { error: "action must be APPROVE, RETURN, or REJECT." },
      { status: 400 }
    );
  }

  try {
    if (action === "APPROVE") {
      return await approveOrder(id);
    }
    if (action === "RETURN") {
      return await returnOrder(id);
    }
    return await rejectOrder(id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * Approves a PENDING order.
 * Uses a Prisma transaction to prevent race conditions between
 * the availability check and the stock decrement.
 */
async function approveOrder(orderId: string) {
  const order = await prisma.$transaction(async (tx: TxClient) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { book: true },
    });

    if (!order) throw new Error("Order not found.");
    if (order.status !== "PENDING") throw new Error("Order is not pending.");
    if (order.book.copiesAvailable <= 0) {
      throw new Error("No copies of this book are currently available.");
    }

    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "APPROVED", approvedAt: now, dueDate },
    });

    await tx.book.update({
      where: { id: order.bookId },
      data: { copiesAvailable: { decrement: 1 } },
    });

    return updated;
  });

  return NextResponse.json(order);
}

/**
 * Marks an APPROVED order as RETURNED.
 * Increments the book's copiesAvailable in the same transaction.
 */
async function returnOrder(orderId: string) {
  const order = await prisma.$transaction(async (tx: TxClient) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });

    if (!order) throw new Error("Order not found.");
    if (order.status !== "APPROVED") throw new Error("Order is not currently approved.");

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "RETURNED", returnedAt: new Date() },
    });

    await tx.book.update({
      where: { id: order.bookId },
      data: { copiesAvailable: { increment: 1 } },
    });

    return updated;
  });

  return NextResponse.json(order);
}

/** Rejects a PENDING order without affecting book stock. */
async function rejectOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Only pending orders can be rejected." },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "REJECTED" },
  });

  return NextResponse.json(updated);
}
