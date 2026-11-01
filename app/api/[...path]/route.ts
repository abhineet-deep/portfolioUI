import { ApiException, OPTIONS, apiGet, methodNotAllowed } from "@/lib/api/handler";
import { z } from "zod";

// Anything under /api/ that no other route matched gets the same JSON error shape as every other failure.
export const GET = apiGet(async (_req, { params }) => {
  const { path } = await params;
  const shown = Array.isArray(path) ? path.join("/") : String(path);
  throw new ApiException(404, "not_found", `No route for /api/${shown}.`);
  // eslint-disable-next-line no-unreachable
  return { schema: z.never(), data: null };
});
export { OPTIONS };
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
