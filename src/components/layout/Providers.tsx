"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side providers wrapper.
 * SessionProvider must be a Client Component — this wrapper lets the root layout
 * (a Server Component) pass children through without becoming a Client Component itself.
 * CartProvider will be added here in Commit 12.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
