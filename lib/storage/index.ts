import { StorageProvider } from "./provider";
import { localProvider } from "./local";
import { s3Provider } from "./s3";

export type StorageBackend = "local" | "s3";

const LOCAL_URL_PREFIX = "/api/uploads/";

function getBackend(): StorageBackend {
  const val = process.env.STORAGE_BACKEND?.trim().toLowerCase();
  if (val === "local" || val === "s3") return val;
  return "local";
}

function isS3Url(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function isLocalUrl(url: string): boolean {
  return url.startsWith(LOCAL_URL_PREFIX);
}

function detectBackendFromUrl(url: string): StorageBackend | null {
  if (isS3Url(url)) return "s3";
  if (isLocalUrl(url)) return "local";
  return null;
}

function getProvider(): StorageProvider {
  return getBackend() === "s3" ? s3Provider : localProvider;
}

function buildUrlMismatchError(url: string): Error {
  const current = getBackend();
  const actual = detectBackendFromUrl(url) || "unknown";
  return new Error(
    `Storage backend mismatch: Cannot manage file '${url}'. ` +
    `The current backend is '${current}' but the file belongs to '${actual}'. ` +
    `Set STORAGE_BACKEND=${actual} in your .env file and restart, ` +
    `or manually remove the file from the other storage location.`
  );
}

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const result = await getProvider().upload(file, fileName, contentType);
  return result.url;
}

export async function deleteFromS3(imageUrl: string): Promise<boolean> {
  const current = getBackend();
  const actual = detectBackendFromUrl(imageUrl);

  if (actual !== null && actual !== current) {
    throw buildUrlMismatchError(imageUrl);
  }

  return getProvider().delete(imageUrl);
}

export function buildS3PublicUrl(key: string): string {
  return getProvider().getUrl(key);
}

export function getS3ObjectKey(_imageUrlOrKey: string): string | null {
  return null;
}
