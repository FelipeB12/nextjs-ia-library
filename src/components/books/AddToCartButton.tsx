"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  bookId: string;
  title: string;
  available: boolean;
}

/**
 * "Add to Borrow Cart" button on the book detail page.
 * Disabled when the book has no copies available.
 *
 * Cart interaction (useCart hook) is wired in Commit 12 when CartProvider is added.
 * For now the button renders correctly with proper disabled state.
 */
export default function AddToCartButton({ title, available }: AddToCartButtonProps) {
  return (
    <Button
      size="lg"
      disabled={!available}
      className="w-full sm:w-auto"
      onClick={() => {
        // Wired to useCart().addToCart() in Commit 12
        console.log("Add to cart:", title);
      }}
    >
      <ShoppingCart className="h-4 w-4" />
      {available ? "Add to Borrow Cart" : "Unavailable"}
    </Button>
  );
}
