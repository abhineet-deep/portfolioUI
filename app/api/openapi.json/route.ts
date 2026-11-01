import { z } from "zod";
import { OPTIONS, apiGet, methodNotAllowed } from "@/lib/api/handler";
import { buildOpenApi } from "@/lib/api/openapi";

export const GET = apiGet((req) => ({
  schema: z.record(z.string(), z.unknown()),
  data: buildOpenApi(new URL(req.url).origin),
}));
export { OPTIONS };
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
