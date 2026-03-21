"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, ShoppingCart, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Top navigation bar.
 * Shows library logo, nav links, auth status, and a cart icon with item count.
 * Cart count is a placeholder (0) until CartProvider is wired in Commit 12.
 */
export default function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Library</span>
        </Link>

        {/* Centre nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Books
          </Link>
          {session && (
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              My Borrows
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Borrow cart */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="Borrow cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>

          {/* Auth */}
          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : session ? (
            <div className="flex items-center gap-1">
              {isAdmin && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin" aria-label="Admin panel">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard" aria-label="My dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
