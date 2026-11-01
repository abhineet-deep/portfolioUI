import { createHash } from "node:crypto";
import type { ZodType } from "zod";
import { ErrorSchema } from "./schemas";
import { LIMIT, checkRate, clientKey, type RateResult } from "./ratelimit";

export class ApiException extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export type Built<T> = {
  schema: ZodType<T>;
  data: unknown;
  /** Cache-Control value. Defaults to a short public cache. */
  cache?: string;
};

type Ctx = { params: Promise<Record<string, string | string[]>> };

const PUBLIC_CACHE = "public, max-age=60, stale-while-revalidate=300";
const NO_STORE = "no-store";
export { NO_STORE };

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "If-None-Match",
  "Access-Control-Expose-Headers": "ETag, Server-Timing, Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining",
  // Lets browsers on other origins read Server-Timing.
  "Timing-Allow-Origin": "*",
  "X-Content-Type-Options": "nosniff",
};

function timing(marks: [string, number][]): string {
  return marks.map(([n, d]) => `${n};dur=${d.toFixed(2)}`).join(", ");
}

function rateHeaders(r: RateResult): Record<string, string> {
  const h: Record<string, string> = { "X-RateLimit-Limit": String(LIMIT), "X-RateLimit-Remaining": String(r.remaining) };
  if (!r.allowed) h["Retry-After"] = String(r.retryAfter);
  return h;
}

function errorResponse(status: number, code: string, message: string, extra: Record<string, string> = {}): Response {
  const body = ErrorSchema.parse({ error: { code, message } });
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": NO_STORE, ...CORS, ...extra },
  });
}

/**
 * Wraps a GET route: rate limit, build + Zod-validate the payload, then add ETag / Cache-Control /
 * Server-Timing / CORS. Throw ApiException from `build` for JSON errors.
 */
export function apiGet(build: (req: Request, ctx: Ctx) => Built<unknown> | Promise<Built<unknown>>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    const t0 = performance.now();
    const rate = checkRate(clientKey(req));
    if (!rate.allowed) {
      return errorResponse(429, "rate_limited", "Too many requests. Try again shortly.", rateHeaders(rate));
    }

    try {
      const built = await build(req, ctx);
      const t1 = performance.now();
      const parsed = built.schema.parse(built.data);
      const t2 = performance.now();
      const body = JSON.stringify(parsed);
      const cache = built.cache ?? PUBLIC_CACHE;

      const headers: Record<string, string> = {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": cache,
        ...CORS,
        ...rateHeaders(rate),
      };

      if (cache !== NO_STORE) {
        const etag = `W/"${createHash("sha1").update(body).digest("base64url").slice(0, 16)}"`;
        headers.ETag = etag;
        if (req.headers.get("if-none-match") === etag) {
          headers["Server-Timing"] = timing([["total", performance.now() - t0]]);
          return new Response(null, { status: 304, headers });
        }
      }

      headers["Server-Timing"] = timing([
        ["build", t1 - t0],
        ["validate", t2 - t1],
        ["total", performance.now() - t0],
      ]);
      return new Response(body, { status: 200, headers });
    } catch (e) {
      if (e instanceof ApiException) return errorResponse(e.status, e.code, e.message, rateHeaders(rate));
      console.error("api error", e);
      return errorResponse(500, "internal_error", "Something went wrong.", rateHeaders(rate));
    }
  };
}

/** Preflight for the GET-only CORS policy. */
export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: { ...CORS, "Access-Control-Max-Age": "86400" } });
}

/** Handler for every non-GET method on a route. */
export function methodNotAllowed(): Response {
  return errorResponse(405, "method_not_allowed", "This API is read-only. Use GET.", { Allow: "GET, OPTIONS" });
}
