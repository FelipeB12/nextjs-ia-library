"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  BookOpen, ShoppingCart, LogOut, LayoutDashboard,
  Settings, MessageCircle, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import ApiKeyInput from "@/components/ai/ApiKeyInput";
import ChatDrawer from "@/components/layout/ChatDrawer";

/**
 * Top navigation bar.
 * Desktop: logo | centre nav links | right actions
 * Mobile:  logo | right actions (cart + hamburger)
 *          hamburger opens a full-width dropdown with all nav links
 */
export default function Navbar() {
  const { data: session, status } = useSession();
  const { count } = useCart();
  const isAdmin = session?.user?.role === "ADMIN";
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() { setMobileOpen(false); }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg" onClick={closeMobile}>
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Library</span>
          </Link>

          {/* Desktop centre nav */}
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
          <div className="flex items-center gap-1 sm:gap-2">
            <ApiKeyInput />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatOpen(true)}
              aria-label="Open book discovery chat"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart" aria-label={`Borrow cart (${count} items)`}>
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
            </Button>

            {/* Desktop auth actions */}
            <div className="hidden sm:flex items-center gap-1">
              {status === "loading" ? (
                <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
              ) : session ? (
                <>
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
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t bg-background px-4 py-4 space-y-1">
            <Link
              href="/"
              onClick={closeMobile}
              className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Books
            </Link>
            {session && (
              <Link
                href="/dashboard"
                onClick={closeMobile}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                My Borrows
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={closeMobile}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Admin Panel
              </Link>
            )}

            <div className="border-t pt-3 mt-3">
              {status !== "loading" && (
                session ? (
                  <button
                    onClick={() => { closeMobile(); signOut({ callbackUrl: "/" }); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors text-muted-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1" onClick={closeMobile}>
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1" onClick={closeMobile}>
                      <Link href="/register">Register</Link>
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </header>

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
