import { execSync } from "node:child_process";
import * as dotenv from "dotenv";
import { prisma } from "../lib/prisma";

dotenv.config();

function ensureSafeEnvironment() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to reset database in production mode");
  }

  if (!process.argv.includes("--yes")) {
    throw new Error(
      "Confirmation required. Re-run with --yes to drop and recreate the public schema."
    );
  }
}

async function resetDatabase() {
  ensureSafeEnvironment();

  console.log("Dropping public schema...");
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS "public" CASCADE');

  console.log("Recreating public schema...");
  await prisma.$executeRawUnsafe('CREATE SCHEMA "public"');
  await prisma.$executeRawUnsafe('GRANT ALL ON SCHEMA "public" TO "public"');

  await prisma.$disconnect();

  console.log("Applying schema with prisma db push...");
  execSync("npm run db:push", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Database reset complete.");
}

resetDatabase().catch(async (error) => {
  console.error("Database reset failed:", error);
  await prisma.$disconnect();
  process.exit(1);
});
