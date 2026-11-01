import { NO_STORE, OPTIONS, apiGet, methodNotAllowed } from "@/lib/api/handler";
import { HealthSchema } from "@/lib/api/schemas";

export const GET = apiGet(() => ({ schema: HealthSchema, data: { status: "ok", time: new Date().toISOString() }, cache: NO_STORE }));
export { OPTIONS };
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
