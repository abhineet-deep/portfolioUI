import { z } from "zod";
import { site } from "@/lib/content";
import { ErrorSchema, HealthSchema, ProfileSchema, ProjectListSchema, ProjectSchema } from "./schemas";

// Component schemas come straight from the Zod types the handlers validate with.
const schema = (s: z.ZodType) => {
  const { $schema: _ignored, ...rest } = z.toJSONSchema(s, { target: "draft-2020-12" }) as Record<string, unknown>;
  void _ignored;
  return rest;
};

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (name: string) => ({ "application/json": { schema: ref(name) } });

const cacheHeaders = {
  ETag: { description: "Weak validator. Send it back as If-None-Match to get a 304.", schema: { type: "string" } },
  "Cache-Control": { schema: { type: "string" } },
  "Server-Timing": { description: "Time spent building, validating and serving the response.", schema: { type: "string" } },
  "X-RateLimit-Remaining": { schema: { type: "integer" } },
};

const errors = {
  "404": { description: "Not found", content: json("Error") },
  "429": {
    description: "Rate limited (30 requests per minute per instance)",
    headers: { "Retry-After": { schema: { type: "integer" } } },
    content: json("Error"),
  },
};

export function buildOpenApi(origin: string) {
  return {
    openapi: "3.1.0",
    info: { title: `${site.name} portfolio API`, version: "1.0.0", description: "Read-only JSON API behind the live terminal on the home page." },
    servers: [{ url: origin }],
    paths: {
      "/api/engineers/abhineet-deep": {
        get: { summary: "Profile", responses: { "200": { description: "Profile", headers: cacheHeaders, content: json("Profile") }, "304": { description: "Not modified" }, ...errors } },
      },
      "/api/projects": {
        get: { summary: "List projects", responses: { "200": { description: "Projects", headers: cacheHeaders, content: json("ProjectList") }, ...errors } },
      },
      "/api/projects/{slug}": {
        get: {
          summary: "One project",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Project", headers: cacheHeaders, content: json("Project") }, ...errors },
        },
      },
      "/api/health": {
        get: { summary: "Liveness check", responses: { "200": { description: "OK", content: json("Health") }, "429": errors["429"] } },
      },
      "/api/openapi.json": {
        get: { summary: "This document", responses: { "200": { description: "OpenAPI 3.1 document" } } },
      },
    },
    components: {
      schemas: {
        Profile: schema(ProfileSchema),
        Project: schema(ProjectSchema),
        ProjectList: schema(ProjectListSchema),
        Health: schema(HealthSchema),
        Error: schema(ErrorSchema),
      },
    },
  };
}
