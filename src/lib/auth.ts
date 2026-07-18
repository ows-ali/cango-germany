import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mode: { label: "Mode", type: "hidden" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const mode = (credentials?.mode as string) || "login";

        if (!email || !password) return null;

        if (mode === "signup") {
          const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (existing.length > 0) return null;

          const passwordHash = await bcrypt.hash(password, 10);
          const id = crypto.randomUUID();
          await db.insert(users).values({ id, email, name: email.split("@")[0], passwordHash });

          return { id, email, name: email.split("@")[0] };
        }

        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = result[0];
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id as string; }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
