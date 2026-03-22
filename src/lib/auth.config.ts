import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible Auth.js config — no Node.js-only imports.
 * Used by middleware.ts (Edge Runtime) for route protection.
 * auth.ts extends this with the full providers and DB callbacks.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    /**
     * Reads id and role from the JWT token.
     * (Writing to the token — DB upsert for Google — happens in auth.ts only.)
     */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as typeof user & { role: string }).role;
      }
      return token;
    },

    /** Exposes id and role to the client-side session. */
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
