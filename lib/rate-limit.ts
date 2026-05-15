interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Use globalThis to persist the rate limit map across HMR in development
const globalForRateLimit = globalThis as unknown as {
  rateLimitMap: Map<string, RateLimitRecord> | undefined;
};

const rateLimitMap =
  globalForRateLimit.rateLimitMap ?? new Map<string, RateLimitRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimitMap = rateLimitMap;
}

/**
 * Simple in-memory rate limiter
 * @param identifier - Unique identifier (e.g., IP address or email)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns boolean - true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Helper to get client IP from request headers
 */
export function getClientIp(req: Request | Headers): string {
  const headers = req instanceof Request ? req.headers : req;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || "unknown";
}
