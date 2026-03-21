"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  coverUrl?: string | null;
}

interface CartContextValue {
  items: CartItem[];
  /** Add a book to the cart. Silently ignores duplicates. */
  addToCart: (item: CartItem) => void;
  /** Remove a single book from the cart by bookId. */
  removeFromCart: (bookId: string) => void;
  /** Empty the cart. */
  clearCart: () => void;
  /** Number of items currently in the cart. */
  count: number;
  /** Returns true if the given bookId is already in the cart. */
  inCart: (bookId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "library_cart";

/**
 * Provides borrow-cart state to the component tree.
 * Cart is persisted to localStorage so it survives page refreshes.
 * Wrap the root layout (inside Providers) with this component.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hydrate from localStorage once on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // Corrupt storage — start fresh
    }
  }, []);

  // Persist every change to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addToCart(item: CartItem) {
    setItems((prev) =>
      prev.some((i) => i.bookId === item.bookId) ? prev : [...prev, item]
    );
  }

  function removeFromCart(bookId: string) {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  }

  function clearCart() {
    setItems([]);
  }

  function inCart(bookId: string) {
    return items.some((i) => i.bookId === bookId);
  }

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, count: items.length, inCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

/** Internal hook — consumed by useCart.ts in src/hooks. */
export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
