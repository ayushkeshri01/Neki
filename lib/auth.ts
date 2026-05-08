import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { getAccountBlockMessage, isAccountActive } from "./account-status";
import { normalizeEmail } from "./registration-token";
import { CredentialsSignin } from "@auth/core/errors";

class AuthClientError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.code = message;
  }
}

const authSecret = process.env.AUTH_SECRET;
if (!authSecret) {
  throw new Error("AUTH_SECRET environment variable is required");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  // Suppress noisy [auth][error] JWTSessionError logs caused by stale cookies
  logger: {
    error: (error: unknown) => {
      const err = error as { name?: string; message?: string };
      if (
        err?.name === "JWTSessionError" ||
        err?.message?.includes("JWTSessionError") ||
        err?.message?.includes("JWEInvalid")
      ) {
        // Silently ignore — stale cookie, NextAuth already returns null session
        return;
      }
      console.error("[auth][error]", error);
    },
    warn: (code: string) => {
      console.warn("[auth][warn]", code);
    },
    debug: () => {},
  },
  providers: [
    Google,
    Credentials({
      name: "Password Logging",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = normalizeEmail(credentials.email as string);
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ 
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            status: true,
            statusReason: true,
            lastLoginAt: true,
            banned: true,
            banReason: true
          }
        });
        
        if (!user) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const passesCheck = await bcrypt.compare(password, user.password);

        if (!passesCheck) {
          return null;
        }

        const blockedMessage = getAccountBlockMessage(
          user.status,
          user.statusReason,
          user.banReason,
          user.banned
        );

        if (!isAccountActive(user.status, user.banned)) {
          throw new AuthClientError(blockedMessage || `Blacklisted:${user.banReason || "Your account has been blacklisted."}`);
        }

        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        } catch {
          // Non-critical — login succeeds regardless
        }

        return { id: user.id, email: user.email, role: user.role, status: user.status };
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const userId = String(user.id);
        token.id = userId;
        token.sub = userId;
        token.role = user.role;
        token.status = user.status;
      }

      return token;
    },
    async session({ session, token }) {
      const userId =
        typeof token.id === "string" && token.id
          ? token.id
          : typeof token.sub === "string" && token.sub
            ? token.sub
            : null;

      if (userId) {
        session.user.id = userId;
        session.user.role = token.role;
        session.user.status = token.status ?? "ACTIVE";

        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            statusReason: true,
            points: true,
            lastLoginAt: true,
            adminMessage: true,
          },
        });
        if (dbUser) {
          session.user.statusReason = dbUser.statusReason;
          session.user.points = dbUser.points;
          session.user.lastLoginAt = dbUser.lastLoginAt?.toISOString() || null;
          session.user.adminMessage = dbUser.adminMessage;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
