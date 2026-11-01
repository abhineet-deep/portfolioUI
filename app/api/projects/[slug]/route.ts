import { ApiException, OPTIONS, apiGet, methodNotAllowed } from "@/lib/api/handler";
import { projectList } from "@/lib/api/data";
import { ProjectSchema } from "@/lib/api/schemas";

export const GET = apiGet(async (_req, { params }) => {
  const { slug } = await params;
  const project = projectList().find((p) => p.slug === slug);
  if (!project) throw new ApiException(404, "project_not_found", `No project with slug "${String(slug)}".`);
  return { schema: ProjectSchema, data: project };
});
export { OPTIONS };
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
