import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();
const UPLOADS_DIR = path.resolve(process.cwd(), "data", "uploads");

function isS3Url(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("http") && url.includes("amazonaws.com");
}

function extractFilenameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "file";
    return decodeURIComponent(last);
  } catch {
    return "file";
  }
}

async function downloadFile(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) {
      console.error(`  [SKIP] HTTP ${res.status} for ${url}`);
      return null;
    }
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch (err) {
    console.error(`  [FAIL] ${(err as Error).message}`);
    return null;
  }
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function migrateSingle(url: string): Promise<string | null> {
  if (!isS3Url(url)) return url;

  const buf = await downloadFile(url);
  if (!buf) return null;

  const originalName = extractFilenameFromUrl(url);
  const localName = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${originalName}`;
  const localPath = path.join(UPLOADS_DIR, localName);
  await fs.writeFile(localPath, buf);

  const localUrl = `/api/uploads/${localName}`;
  console.log(`  OK  ${url.slice(0, 80)}... → ${localUrl}`);
  return localUrl;
}

async function migrateUsers(): Promise<{ ok: number; skip: number; fail: number }> {
  const users = await prisma.user.findMany({ where: { image: { not: null } }, select: { id: true, image: true } });
  let ok = 0, skip = 0, fail = 0;

  for (const u of users) {
    if (!u.image || !isS3Url(u.image)) { skip++; continue; }
    const localUrl = await migrateSingle(u.image);
    if (localUrl) {
      await prisma.user.update({ where: { id: u.id }, data: { image: localUrl } });
      ok++;
    } else {
      fail++;
    }
  }
  return { ok, skip, fail };
}

async function migrateCommunities(): Promise<{ ok: number; skip: number; fail: number }> {
  const communities = await prisma.community.findMany({ where: { image: { not: null } }, select: { id: true, image: true } });
  let ok = 0, skip = 0, fail = 0;

  for (const c of communities) {
    if (!c.image || !isS3Url(c.image)) { skip++; continue; }
    const localUrl = await migrateSingle(c.image);
    if (localUrl) {
      await prisma.community.update({ where: { id: c.id }, data: { image: localUrl } });
      ok++;
    } else {
      fail++;
    }
  }
  return { ok, skip, fail };
}

async function migratePosts(): Promise<{ ok: number; skip: number; fail: number }> {
  const posts = await prisma.post.findMany({ select: { id: true, images: true } });
  let ok = 0, skip = 0, fail = 0;

  for (const p of posts) {
    const s3Images = p.images.filter(isS3Url);
    if (s3Images.length === 0) { skip++; continue; }

    const migrated: string[] = [];
    let hadFailure = false;

    for (const img of p.images) {
      if (isS3Url(img)) {
        const localUrl = await migrateSingle(img);
        if (localUrl) {
          migrated.push(localUrl);
        } else {
          hadFailure = true;
          migrated.push(img);
        }
      } else {
        migrated.push(img);
      }
    }

    if (hadFailure) {
      fail++;
    } else if (s3Images.length > 0) {
      ok++;
    }

    await prisma.post.update({ where: { id: p.id }, data: { images: migrated } });
  }
  return { ok, skip, fail };
}

async function main() {
  await ensureDir();

  console.log("\n=== Migrating Users ===\n");
  const users = await migrateUsers();
  console.log(`Users: ${users.ok} migrated, ${users.skip} skipped, ${users.fail} failed`);

  console.log("\n=== Migrating Communities ===\n");
  const communities = await migrateCommunities();
  console.log(`Communities: ${communities.ok} migrated, ${communities.skip} skipped, ${communities.fail} failed`);

  console.log("\n=== Migrating Posts ===\n");
  const posts = await migratePosts();
  console.log(`Posts: ${posts.ok} migrated, ${posts.skip} skipped, ${posts.fail} failed`);

  console.log("\n=== Migration Complete ===\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
