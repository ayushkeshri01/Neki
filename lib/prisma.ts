import { PrismaClient } from "@prisma/client";

// In serverless production, prefer pooled DB URLs injected by integrations.
const pooledDatabaseUrl =
  process.env.POSTGRES_PRISMA_URL?.trim() || process.env.POSTGRES_URL?.trim();

if (process.env.NODE_ENV === "production" && pooledDatabaseUrl) {
  process.env.DATABASE_URL = pooledDatabaseUrl;
}

const directUrl = process.env.POSTGRES_URL_NON_POOLING?.trim();
if (directUrl) process.env.DIRECT_URL = directUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : isBuildPhase
        ? []
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
