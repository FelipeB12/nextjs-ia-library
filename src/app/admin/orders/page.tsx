import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderTable from "@/components/orders/OrderTable";

export const metadata = { title: "Order Management — Library Admin" };

/**
 * Admin order management page — Server Component.
 * Fetches all orders with user and book details, then renders the
 * interactive OrderTable Client Component.
 */
export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const orders = await prisma.order.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true, author: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve, reject, or mark borrow requests as returned.
        </p>
      </div>

      <OrderTable
        initialOrders={orders.map((o: {
          id: string;
          status: "PENDING" | "APPROVED" | "RETURNED" | "REJECTED";
          createdAt: Date;
          approvedAt: Date | null;
          dueDate: Date | null;
          returnedAt: Date | null;
          user: { id: string; name: string | null; email: string };
          book: { id: string; title: string; author: string };
        }) => ({
          id: o.id,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
          approvedAt: o.approvedAt?.toISOString() ?? null,
          dueDate: o.dueDate?.toISOString() ?? null,
          returnedAt: o.returnedAt?.toISOString() ?? null,
          user: o.user,
          book: o.book,
        }))}
      />
    </div>
  );
}
