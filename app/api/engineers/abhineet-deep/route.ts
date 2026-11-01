import { OPTIONS, apiGet, methodNotAllowed } from "@/lib/api/handler";
import { buildProfile } from "@/lib/api/data";
import { ProfileSchema } from "@/lib/api/schemas";

export const GET = apiGet(() => ({ schema: ProfileSchema, data: buildProfile() }));
export { OPTIONS };
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
