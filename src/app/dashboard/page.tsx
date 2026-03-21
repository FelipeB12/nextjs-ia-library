import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserOrderList from "@/components/orders/UserOrderList";

export const metadata = {
  title: "My Borrows — Library",
};

/**
 * Customer dashboard — Server Component.
 * Fetches all orders for the current user directly from the database.
 * Redirects to /login if the user is not authenticated (middleware also guards this).
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
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
    },
  });

  // Counts for the stats row
  const pending = orders.filter((o: { status: string }) => o.status === "PENDING").length;
  const approved = orders.filter((o: { status: string }) => o.status === "APPROVED").length;
  const returned = orders.filter((o: { status: string }) => o.status === "RETURNED").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">My Borrows</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      {/* Quick stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{pending}</div>
            <div className="text-xs text-muted-foreground mt-1">Awaiting approval</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{approved}</div>
            <div className="text-xs text-muted-foreground mt-1">Currently borrowed</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{returned}</div>
            <div className="text-xs text-muted-foreground mt-1">Returned</div>
          </div>
        </div>
      )}

      {/* Order list with status tabs */}
      <UserOrderList
        orders={orders.map((o: {
          id: string;
          status: "PENDING" | "APPROVED" | "RETURNED" | "REJECTED";
          createdAt: Date;
          approvedAt: Date | null;
          dueDate: Date | null;
          returnedAt: Date | null;
          book: { id: string; title: string; author: string; genre: string; coverUrl: string | null };
        }) => ({
          id: o.id,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
          approvedAt: o.approvedAt?.toISOString() ?? null,
          dueDate: o.dueDate?.toISOString() ?? null,
          returnedAt: o.returnedAt?.toISOString() ?? null,
          book: o.book,
        }))}
      />
    </div>
  );
}
