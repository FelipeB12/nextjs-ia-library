import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    /**
     * Google OAuth provider — enables SSO login.
     * Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local to activate.
     * First-time Google users are automatically created as CUSTOMER role.
     */
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    /**
     * Email/password provider — validates credentials against the database.
     * Password is stored as a bcrypt hash (10 rounds).
     */
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * Populates the JWT token with user id and role.
     * For Google sign-ins, upserts the user in the database on first login
     * so they get a persistent id and default CUSTOMER role.
     */
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        // Upsert Google user — creates on first login, updates name/image on subsequent ones
        const dbUser = await prisma.user.upsert({
          where: { email: profile.email },
          update: {
            name: profile.name ?? null,
            image: (profile as { picture?: string }).picture ?? null,
          },
          create: {
            email: profile.email,
            name: profile.name ?? null,
            image: (profile as { picture?: string }).picture ?? null,
            role: "CUSTOMER",
          },
        });
        token.id = dbUser.id;
        token.role = dbUser.role;
      } else if (user) {
        // Credentials sign-in — user object comes from authorize()
        token.id = user.id;
        token.role = (user as typeof user & { role: string }).role;
      }
      return token;
    },

    /** Exposes id and role from the JWT token to the client-side session. */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },
});
