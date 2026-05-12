/**
 * Simple in-memory rate limiter per IP.
 * Resets the counter after `windowMs` milliseconds.
 * Returns true if the request is allowed, false if rate-limited.
 */
const counters = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  ip: string,
  maxRequests = 10,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = counters.get(ip);

  if (!entry || now > entry.resetAt) {
    counters.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= maxRequests) return false; // blocked

  entry.count++;
  return true; // allowed
}
