import { randomBytes, createHash } from "crypto";

const DEFAULT_TOKEN_TTL_MS = 15 * 60 * 1000;

function getTokenPepper(): string {
  const pepper = process.env.AUTH_SECRET;
  if (!pepper) {
    throw new Error("AUTH_SECRET environment variable is required");
  }
  return pepper;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashRegistrationToken(token: string): string {
  return createHash("sha256")
    .update(`${token}:${getTokenPepper()}`)
    .digest("hex");
}

export function createRegistrationToken(ttlMs = DEFAULT_TOKEN_TTL_MS): {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const rawToken = randomBytes(32).toString("hex");

  return {
    rawToken,
    tokenHash: hashRegistrationToken(rawToken),
    expiresAt: new Date(Date.now() + ttlMs),
  };
}
