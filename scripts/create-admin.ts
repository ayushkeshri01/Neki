import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getDomainFromEmail(email: string): string {
  const parts = email.toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("ADMIN_EMAIL must be a valid email address");
  }

  return parts[1];
}

async function createAdmin() {
  console.log("🔧 Neki Admin Setup");
  console.log("========================\n");

  try {
    const ADMIN_EMAIL = requireEnv("ADMIN_EMAIL");
    const ADMIN_NAME = requireEnv("ADMIN_NAME");
    const ADMIN_PASSWORD = requireEnv("ADMIN_PASSWORD");

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    let user;
    if (existingUser) {
      if (existingUser.role === Role.ADMIN) {
        console.log("⚠️  User is already an admin!");
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Name: ${existingUser.name}`);
        user = existingUser;
      } else {
        console.log("📧 User exists but is not an admin. Promoting to admin...");
        user = await prisma.user.update({
          where: { email: ADMIN_EMAIL },
          data: { role: Role.ADMIN },
        });
        console.log(`✅ ${user.email} has been promoted to Admin.`);
      }
    } else {
      console.log("📧 Creating new admin user...");
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Name: ${ADMIN_NAME}`);

      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

      user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password: hashedPassword,
          role: Role.ADMIN,
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(ADMIN_NAME)}&background=16a34a&color=fff`,
        },
      });
      console.log("\n✅ Admin created successfully!");
    }

    // Extract domain from email for allowed domain restriction
    const domain = getDomainFromEmail(ADMIN_EMAIL);

    console.log("\n🔒 Setting up domain restriction...");
    console.log(`   Allowed domain: ${domain}`);

    const settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: {
        allowedDomains: true,
        privacyPolicyVersion: true,
      },
    });

    const mergedDomains = Array.from(new Set([...(settings?.allowedDomains ?? []), domain]));

    await prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        allowedDomains: mergedDomains,
        privacyPolicyVersion: settings?.privacyPolicyVersion ?? "v1",
      },
      update: {
        allowedDomains: mergedDomains,
      },
    });

    console.log("\n✅ Admin Setup Complete!");
    console.log("========================");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Allowed domain: ${domain}`);
    console.log("\n📋 Next Steps:");
    console.log(`   1. Sign in with this email at http://localhost:3000/login`);
    console.log("   2. Go to /admin to create communities");
    console.log(`   3. Users with @${domain} emails can now join!\n`);

  } catch (error) {
    console.error("\n❌ Error creating admin:", error);
    console.log("\nMake sure you have:");
    console.log("   - Run 'npm run db:migrate' to create database tables");
    console.log("   - Started your PostgreSQL database");
    console.log("   - Set DATABASE_URL in .env file\n");
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
