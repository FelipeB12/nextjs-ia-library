import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

/**
 * Route protection middleware powered by NextAuth v5.
 * - /admin/* — requires an authenticated user with ADMIN role
 * - /dashboard/* — requires any authenticated user
 * All other routes are public.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Run middleware on all routes except static assets and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
