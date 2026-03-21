"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ShoppingCart, BookOpen } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";

/**
 * Borrow cart page.
 *
 * Flow:
 * 1. Unauthenticated users see a prompt to sign in before checking out.
 * 2. On checkout, POST /api/orders is called with all bookIds in the cart.
 * 3. On success the cart is cleared and the user is redirected to /dashboard.
 * 4. Per-book failures (out-of-stock race condition) are surfaced via toast.
 */
export default function CartPage() {
  const { data: session, status } = useSession();
  const { items, removeFromCart, clearCart, count } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    // Guard: must be logged in
    if (!session?.user) {
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (count === 0) return;

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookIds: items.map((i) => i.bookId) }),
      });

      const data = await res.json();

      // Surface any per-book failures
      const failed: string[] = (data.results ?? [])
        .filter((r: { success: boolean; error?: string }) => !r.success)
        .map((r: { error?: string }) => r.error ?? "Unknown error");

      if (failed.length > 0) {
        failed.forEach((msg) =>
          toast({ title: "Could not borrow", description: msg, variant: "destructive" })
        );
      }

      const succeeded = (data.results ?? []).filter(
        (r: { success: boolean }) => r.success
      ).length;

      if (succeeded > 0) {
        clearCart();
        toast({
          title: "Borrow request submitted!",
          description: `${succeeded} book${succeeded > 1 ? "s" : ""} sent for librarian approval.`,
        });
        router.push("/dashboard");
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Loading state while session is resolving
  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted mb-8" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-6 w-6" />
        <h1 className="text-2xl font-bold tracking-tight">Borrow Cart</h1>
        {count > 0 && (
          <span className="text-sm text-muted-foreground">({count} {count === 1 ? "book" : "books"})</span>
        )}
      </div>

      {/* Empty state */}
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-4">
          <BookOpen className="h-12 w-12 opacity-20" />
          <div>
            <p className="font-medium text-lg">Your cart is empty</p>
            <p className="text-sm mt-1">Browse books and add them to your borrow cart.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Browse books</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* Item list */}
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.bookId}
                item={item}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Summary + checkout */}
          <div className="space-y-4">
            {/* Sign-in prompt for guests */}
            {!session?.user && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-medium">Sign in to check out</p>
                <p className="mt-1">You need an account to submit a borrow request.</p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/login?callbackUrl=/cart">Sign in</Link>
                </Button>
              </div>
            )}

            <CartSummary
              count={count}
              loading={loading}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      )}
    </div>
  );
}
