// Sliding-window rate limiter, in memory.
//
// NOTE: this state lives inside one serverless instance. Vercel may run several instances and
// recycles them, so the limit is per instance, not global. That's fine for a portfolio API; a real
// service would back this with Redis (e.g. an atomic INCR with a TTL) so every instance shares it.

export const LIMIT = 30;
export const WINDOW_MS = 60_000;

const hits = new Map<string, number[]>();

export type RateResult = { allowed: boolean; remaining: number; retryAfter: number };

export function checkRate(key: string, now = Date.now()): RateResult {
  const windowStart = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= LIMIT) {
    hits.set(key, recent);
    const oldest = recent[0] ?? now;
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound.
  if (hits.size > 5_000) {
    for (const [k, v] of hits) if ((v[v.length - 1] ?? 0) <= windowStart) hits.delete(k);
  }
  return { allowed: true, remaining: LIMIT - recent.length, retryAfter: 0 };
}

export function clientKey(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";
}
