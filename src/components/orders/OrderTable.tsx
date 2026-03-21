"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, RotateCcw, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = "PENDING" | "APPROVED" | "RETURNED" | "REJECTED";

interface OrderRow {
  id: string;
  status: OrderStatus;
  createdAt: string;
  approvedAt?: string | null;
  dueDate?: string | null;
  returnedAt?: string | null;
  user: { id: string; name?: string | null; email: string };
  book: { id: string; title: string; author: string };
}

interface OrderTableProps {
  initialOrders: OrderRow[];
}

function statusBadge(status: OrderStatus, dueDate?: string | null) {
  const overdue =
    status === "APPROVED" && dueDate && new Date(dueDate) < new Date();

  if (overdue) return { variant: "destructive" as const, label: "Overdue" };

  const map: Record<OrderStatus, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
    PENDING: { variant: "secondary", label: "Pending" },
    APPROVED: { variant: "default", label: "Approved" },
    RETURNED: { variant: "outline", label: "Returned" },
    REJECTED: { variant: "destructive", label: "Rejected" },
  };
  return map[status];
}

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/**
 * Admin order management table.
 * Displays all orders with approve / reject / mark-returned actions.
 * Optimistically updates local state after each action succeeds.
 */
export default function OrderTable({ initialOrders }: OrderTableProps) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function performAction(orderId: string, action: "APPROVE" | "RETURN" | "REJECT") {
    setLoadingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Action failed.");
      }

      // Optimistically update the row status in local state
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const now = new Date().toISOString();
          if (action === "APPROVE") {
            const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            return { ...o, status: "APPROVED", approvedAt: now, dueDate };
          }
          if (action === "RETURN") return { ...o, status: "RETURNED", returnedAt: now };
          return { ...o, status: "REJECTED" };
        })
      );

      const labels = { APPROVE: "approved", RETURN: "marked as returned", REJECT: "rejected" };
      toast({ title: `Order ${labels[action]}` });
    } catch (err) {
      toast({
        title: "Action failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <p className="font-medium">No orders found</p>
        <p className="text-sm">Orders will appear here once customers submit borrow requests.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead>Due date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const { variant, label } = statusBadge(order.status, order.dueDate);
          const isOverdue =
            order.status === "APPROVED" &&
            order.dueDate &&
            new Date(order.dueDate) < new Date();
          const busy = loadingId === order.id;

          return (
            <TableRow key={order.id} className={isOverdue ? "bg-destructive/5" : undefined}>
              <TableCell className="max-w-[200px]">
                <Link
                  href={`/books/${order.book.id}`}
                  className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                >
                  {order.book.title}
                </Link>
                <p className="text-xs text-muted-foreground truncate">{order.book.author}</p>
              </TableCell>

              <TableCell className="text-sm">
                <p className="font-medium truncate max-w-[140px]">
                  {order.user.name ?? order.user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {order.user.name ? order.user.email : ""}
                </p>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Badge variant={variant}>{label}</Badge>
                  {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                </div>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {fmt(order.createdAt)}
              </TableCell>

              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {fmt(order.dueDate)}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {order.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        disabled={busy}
                        onClick={() => performAction(order.id, "APPROVE")}
                        aria-label="Approve order"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => performAction(order.id, "REJECT")}
                        aria-label="Reject order"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </>
                  )}
                  {order.status === "APPROVED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => performAction(order.id, "RETURN")}
                      aria-label="Mark as returned"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Returned
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
