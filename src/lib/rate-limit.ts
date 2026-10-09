/**
 * In-memory rate limiter using sliding window algorithm.
 * Tracks requests per IP address to prevent API abuse.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (now - entry.lastRefill > windowMs * 2) {
      store.delete(key);
    }
  }
}

export function rateLimit(
  ip: string,
  maxRequests: number = 20,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  cleanup(windowMs);

  const entry = store.get(ip);

  if (!entry) {
    store.set(ip, { tokens: maxRequests - 1, lastRefill: now });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  // Token bucket refill
  const elapsed = now - entry.lastRefill;
  const refillRate = maxRequests / windowMs;
  const refill = elapsed * refillRate;
  entry.tokens = Math.min(maxRequests, entry.tokens + refill);
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    const resetAt = now + ((1 - entry.tokens) / refillRate);
    return { allowed: false, remaining: 0, resetAt };
  }

  entry.tokens -= 1;
  store.set(ip, entry);

  return {
    allowed: true,
    remaining: Math.floor(entry.tokens),
    resetAt: now + windowMs,
  };
}
