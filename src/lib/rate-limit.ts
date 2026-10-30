import "server-only";

/**
 * A small in-memory, fixed-window rate limiter keyed by client IP.
 * It is per-process and resets on restart — enough to stop accidental
 * hammering of the model on a single instance, not a distributed quota.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_PER_MINUTE) || 8;
const MAX_TRACKED = 5_000;

const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  if (hits.size > MAX_TRACKED) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }

  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count += 1;
  return {
    allowed: entry.count <= MAX_REQUESTS,
    retryAfter: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}
