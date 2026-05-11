import { Role, UserStatus } from "@prisma/client";
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      status: UserStatus;
      statusReason?: string | null;
      points: number;
      lastLoginAt?: string | null;
      adminMessage?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    status: UserStatus;
    points?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status?: UserStatus;
    lastLoginAt?: string;
  }
}
