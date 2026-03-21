"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type OrderStatus = "PENDING" | "APPROVED" | "RETURNED" | "REJECTED";

interface OrderBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverUrl?: string | null;
}

interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  approvedAt?: string | null;
  dueDate?: string | null;
  returnedAt?: string | null;
  book: OrderBook;
}

interface UserOrderListProps {
  orders: Order[];
}

const STATUS_TABS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Returned", value: "RETURNED" },
  { label: "Rejected", value: "REJECTED" },
] as const;

type TabValue = (typeof STATUS_TABS)[number]["value"];

/** Maps an order status to a badge variant and human-readable label. */
function statusBadge(status: OrderStatus, dueDate?: string | null) {
  const overdue =
    status === "APPROVED" && dueDate && new Date(dueDate) < new Date();

  if (overdue) {
    return { variant: "destructive" as const, label: "Overdue" };
  }

  const map: Record<OrderStatus, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
    PENDING: { variant: "secondary", label: "Pending approval" },
    APPROVED: { variant: "default", label: "Borrowed" },
    RETURNED: { variant: "outline", label: "Returned" },
    REJECTED: { variant: "destructive", label: "Rejected" },
  };

  return map[status];
}

/** Formats a date string as a short human-readable date. */
function fmt(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Renders the customer's borrow history with status filter tabs.
 * Highlights overdue items (APPROVED with dueDate in the past).
 */
export default function UserOrderList({ orders }: UserOrderListProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("ALL");

  const filtered =
    activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === "ALL"
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
          <BookOpen className="h-10 w-10 opacity-20" />
          <p className="font-medium">No {activeTab === "ALL" ? "" : activeTab.toLowerCase()} orders yet</p>
          {activeTab === "ALL" && (
            <p className="text-sm">
              Browse books and add them to your{" "}
              <Link href="/" className="underline hover:text-foreground">
                borrow cart
              </Link>
              .
            </p>
          )}
        </div>
      )}

      {/* Order cards */}
      <div className="space-y-3">
        {filtered.map((order) => {
          const { variant, label } = statusBadge(order.status, order.dueDate);
          const isOverdue =
            order.status === "APPROVED" &&
            order.dueDate &&
            new Date(order.dueDate) < new Date();

          return (
            <div
              key={order.id}
              className={`rounded-lg border p-4 flex flex-col gap-3 sm:flex-row sm:items-center ${
                isOverdue ? "border-destructive/50 bg-destructive/5" : "bg-card"
              }`}
            >
              {/* Book info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <Link
                    href={`/books/${order.book.id}`}
                    className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
                  >
                    {order.book.title}
                  </Link>
                  <Badge variant={variant}>{label}</Badge>
                  {isOverdue && (
                    <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      Please return
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.book.author} · {order.book.genre}
                </p>
              </div>

              {/* Dates */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground shrink-0">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Requested {fmt(order.createdAt)}
                </span>
                {order.dueDate && (
                  <span
                    className={`flex items-center gap-1 ${
                      isOverdue ? "text-destructive font-medium" : ""
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    Due {fmt(order.dueDate)}
                  </span>
                )}
                {order.returnedAt && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Calendar className="h-3 w-3" />
                    Returned {fmt(order.returnedAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
