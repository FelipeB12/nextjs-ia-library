"use client";

import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
  bookId: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  available: boolean;
}

/**
 * "Add to Borrow Cart" button on the book detail page.
 * Disabled when unavailable or already in the cart.
 * Toggles to a "In Cart" state once added.
 */
export default function AddToCartButton({
  bookId,
  title,
  author,
  coverUrl,
  available,
}: AddToCartButtonProps) {
  const { addToCart, inCart } = useCart();
  const { toast } = useToast();
  const alreadyInCart = inCart(bookId);

  function handleAdd() {
    addToCart({ bookId, title, author, coverUrl });
    toast({ title: "Added to cart", description: `"${title}" is in your borrow cart.` });
  }

  if (!available) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        <ShoppingCart className="h-4 w-4" />
        Unavailable
      </Button>
    );
  }

  if (alreadyInCart) {
    return (
      <Button size="lg" variant="secondary" disabled className="w-full sm:w-auto">
        <Check className="h-4 w-4" />
        In Borrow Cart
      </Button>
    );
  }

  return (
    <Button size="lg" onClick={handleAdd} className="w-full sm:w-auto">
      <ShoppingCart className="h-4 w-4" />
      Add to Borrow Cart
    </Button>
  );
}
