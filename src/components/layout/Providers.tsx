"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/cart/CartProvider";

/**
 * Client-side providers wrapper.
 * SessionProvider must be a Client Component — this wrapper lets the root layout
 * (a Server Component) pass children through without becoming a Client Component itself.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
