import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ClipboardList, Users, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin Overview — Library" };

/**
 * Admin dashboard overview — Server Component.
 * Shows key library stats: total books, active borrows, pending requests, overdue items.
 */
export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const [totalBooks, totalUsers, pendingOrders, approvedOrders, overdueOrders] =
    await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "APPROVED" } }),
      prisma.order.count({
        where: { status: "APPROVED", dueDate: { lt: new Date() } },
      }),
    ]);

  const stats = [
    {
      label: "Total Books",
      value: totalBooks,
      icon: BookOpen,
      href: "/admin/books",
      color: "text-blue-600",
    },
    {
      label: "Registered Members",
      value: totalUsers,
      icon: Users,
      href: null,
      color: "text-purple-600",
    },
    {
      label: "Pending Requests",
      value: pendingOrders,
      icon: ClipboardList,
      href: "/admin/orders",
      color: "text-amber-600",
    },
    {
      label: "Active Borrows",
      value: approvedOrders,
      icon: BookOpen,
      href: "/admin/orders",
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Library management at a glance
        </p>
      </div>

      {/* Overdue alert */}
      {overdueOrders > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{overdueOrders}</strong> overdue borrow{overdueOrders > 1 ? "s" : ""} need attention.
          </span>
          <Button asChild size="sm" variant="destructive" className="ml-auto">
            <Link href="/admin/orders">View orders</Link>
          </Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Card key={label} className={href ? "hover:shadow-md transition-shadow" : undefined}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
              {href && (
                <Link
                  href={href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1 block"
                >
                  View →
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/admin/orders">Manage orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/books">Manage books</Link>
        </Button>
      </div>
    </div>
  );
}
