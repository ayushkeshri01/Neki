import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { StorageProvider, UploadResult } from "./provider";

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    const region = process.env.AWS_REGION?.trim() || "us-east-1";
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("AWS credentials (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY) must be configured for S3 storage backend");
    }

    s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return s3Client;
}

function getS3Config() {
  const bucket = process.env.AWS_S3_BUCKET?.trim();
  const region = process.env.AWS_REGION?.trim() || "us-east-1";

  if (!bucket) {
    throw new Error("AWS_S3_BUCKET environment variable is required for S3 storage backend");
  }

  return { bucket, region };
}

function sanitizeFileName(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop()?.trim() || "upload";
  const sanitized = baseName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "");

  return sanitized || "upload";
}

function encodeKeyPath(key: string): string {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function safeDecodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function decodeKeyPath(key: string): string {
  return key
    .split("/")
    .map((segment) => safeDecodeSegment(segment))
    .join("/");
}

function normalizeRawKey(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.includes("://")) return null;
  return decodeKeyPath(trimmed.replace(/^\/+/, ""));
}

function getS3ObjectKey(imageUrlOrKey: string): string | null {
  const rawKey = normalizeRawKey(imageUrlOrKey);
  if (rawKey) return rawKey;

  try {
    const { bucket, region } = getS3Config();
    const url = new URL(imageUrlOrKey);
    const pathname = decodeKeyPath(url.pathname.replace(/^\/+/, ""));

    if (
      url.hostname === `${bucket}.s3.${region}.amazonaws.com` ||
      url.hostname === `${bucket}.s3.amazonaws.com`
    ) {
      return pathname || null;
    }

    if (url.hostname === `s3.${region}.amazonaws.com` || url.hostname === "s3.amazonaws.com") {
      const [pathBucket, ...keyParts] = pathname.split("/");
      if (pathBucket === bucket && keyParts.length > 0) {
        return keyParts.join("/");
      }
    }

    return null;
  } catch {
    return null;
  }
}

function buildS3PublicUrl(key: string): string {
  const { bucket, region } = getS3Config();
  const normalizedKey = key.replace(/^\/+/, "");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeKeyPath(normalizedKey)}`;
}

export const s3Provider: StorageProvider = {
  async upload(file: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
    const key = `uploads/${Date.now()}-${sanitizeFileName(fileName)}`;
    const { bucket } = getS3Config();

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );

    return { url: buildS3PublicUrl(key), key };
  },

  async delete(urlOrPath: string): Promise<boolean> {
    try {
      const key = getS3ObjectKey(urlOrPath);
      if (!key) return false;

      const { bucket } = getS3Config();
      await getS3Client().send(
        new DeleteObjectCommand({ Bucket: bucket, Key: key })
      );
      return true;
    } catch (error) {
      console.error("Error deleting from S3:", error);
      return false;
    }
  },

  getUrl(key: string): string {
    return buildS3PublicUrl(key);
  },
};
