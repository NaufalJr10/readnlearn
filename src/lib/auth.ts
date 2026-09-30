import "server-only";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { db } from "./db";
import { hit, getLockRemainingMs, reset, POLICIES } from "./rate-limit";
import { loginSchema } from "./validation";
import type { LoginErrorCode } from "./auth-errors";

const THIRTY_DAYS = 30 * 24 * 60 * 60;
const STATUS_RECHECK_MS = 5 * 60_000;

// Comparing against a real hash when the user doesn't exist keeps response timing uniform.
const DUMMY_HASH = "$2b$12$dVMqycvfngVxX0xDuLX5ZOBkvxLlJ.OF34buV7GquIBvr0jrkvfSy";

function fail(code: LoginErrorCode): never {
  throw new Error(code);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: THIRTY_DAYS, updateAge: 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) fail("invalid_credentials");
        const { email, password } = parsed.data;
        const limitKey = `user-login:${email}`;
        if ((await getLockRemainingMs(limitKey)) > 0) fail("rate_limited");

        const user = await db.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid || user.role === "admin") {
          await hit(limitKey, POLICIES.userLogin);
          fail("invalid_credentials");
        }
        await reset(limitKey);
        if (user.status !== "active") fail(user.status);

        await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return { ...token, id: user.id, role: user.role, statusCheckedAt: Date.now() };
      }
      if (!token.id) return token;
      if (Date.now() - (token.statusCheckedAt ?? 0) > STATUS_RECHECK_MS) {
        const current = await db.user.findUnique({ where: { id: token.id }, select: { status: true, name: true } });
        if (!current || current.status !== "active") return { revoked: true };
        await db.user.update({ where: { id: token.id }, data: { lastActiveAt: new Date() } });
        return { ...token, name: current.name, statusCheckedAt: Date.now() };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && token.role) {
        session.user = { ...session.user, id: token.id, role: token.role, name: token.name, email: token.email };
      }
      return session;
    },
  },
};

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session.user : null;
}

export async function requireRole(role: "student" | "tutor", callbackPath: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  if (user.role !== role) redirect(user.role === "tutor" ? "/tutor" : "/student");
  return user;
}
