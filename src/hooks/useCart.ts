"use client";

import { useCartContext } from "@/components/cart/CartProvider";

/**
 * Hook for reading and updating the borrow cart.
 *
 * @example
 * const { items, addToCart, removeFromCart, clearCart, count, inCart } = useCart();
 */
export function useCart() {
  return useCartContext();
}
