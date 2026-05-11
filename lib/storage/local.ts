import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { StorageProvider, UploadResult } from "./provider";

const UPLOADS_DIR = path.resolve(process.cwd(), "data", "uploads");
const URL_PREFIX = "/api/uploads";

function sanitizeFileName(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop()?.trim() || "upload";
  const sanitized = baseName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "");

  return sanitized || "upload";
}

function randomToken(): string {
  return crypto.randomUUID().split("-")[0] + crypto.randomUUID().split("-")[1];
}

async function ensureUploadsDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch {
    // exists
  }
}

function resolveLocalPath(urlOrPath: string): string | null {
  if (urlOrPath.startsWith(URL_PREFIX)) {
    const relative = urlOrPath.slice(URL_PREFIX.length).replace(/^\//, "");
    return path.join(UPLOADS_DIR, relative);
  }
  return null;
}

export const localProvider: StorageProvider = {
  async upload(file: Buffer, fileName: string, _contentType: string): Promise<UploadResult> {
    await ensureUploadsDir();
    const key = `${Date.now()}-${randomToken()}-${sanitizeFileName(fileName)}`;
    const filePath = path.join(UPLOADS_DIR, key);
    await fs.writeFile(filePath, file);
    return { url: `${URL_PREFIX}/${key}`, key };
  },

  async delete(urlOrPath: string): Promise<boolean> {
    const filePath = resolveLocalPath(urlOrPath);
    if (!filePath) return false;
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  },

  getUrl(key: string): string {
    const normalizedKey = key.replace(/^\//, "");
    return `${URL_PREFIX}/${normalizedKey}`;
  },
};

export { UPLOADS_DIR, URL_PREFIX };
