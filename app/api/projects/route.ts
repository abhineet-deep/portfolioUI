import { OPTIONS, apiGet, methodNotAllowed } from "@/lib/api/handler";
import { projectList } from "@/lib/api/data";
import { ProjectListSchema } from "@/lib/api/schemas";

export const GET = apiGet(() => ({ schema: ProjectListSchema, data: { projects: projectList() } }));
export { OPTIONS };
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
