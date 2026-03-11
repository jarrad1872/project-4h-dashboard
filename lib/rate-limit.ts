/**
 * Simple in-memory rate limiter for expensive API endpoints (AI generation).
 * Tracks requests per key (IP or token) within a sliding window.
 *
 * Note: resets on deploy/restart. For multi-instance deployments,
 * replace with Redis or Upstash rate limiting.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 10 * 60_000;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 5 * 60_000);

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - opts.windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= opts.limit) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: oldest + opts.windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: opts.limit - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Extract a rate-limit key from a request.
 * Uses Bearer token if present, otherwise falls back to IP-like identifier.
 */
export function rateLimitKey(request: Request): string {
  const auth = request.headers.get("Authorization") ?? "";
  if (auth.startsWith("Bearer ")) return `token:${auth.slice(7, 20)}`;
  return `origin:${request.headers.get("X-Forwarded-For") ?? "unknown"}`;
}
