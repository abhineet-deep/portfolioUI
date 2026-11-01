import { z } from "zod";

// Response shapes for the public API. Every response body is parsed through one of these
// before it is sent, so the contract in /api/openapi.json can't drift from what's returned.

export const ProjectSchema = z.object({
  slug: z.string().describe("URL-safe project id"),
  title: z.string(),
  status: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  href: z.url().optional(),
});

export const ProfileSchema = z.object({
  name: z.string(),
  headline: z.string(),
  summary: z.string(),
  contact: z.object({ email: z.email(), github: z.url(), linkedin: z.url() }),
  experience: z.array(
    z.object({
      org: z.string(),
      role: z.string().optional(),
      period: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
  certifications: z.array(z.object({ name: z.string(), year: z.string() })),
  stack: z.array(z.string()),
  projects: z.array(z.object({ slug: z.string(), title: z.string() })),
});

export const ProjectListSchema = z.object({ projects: z.array(ProjectSchema) });

export const HealthSchema = z.object({
  status: z.literal("ok"),
  time: z.iso.datetime(),
});

export const ErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

export type ApiError = z.infer<typeof ErrorSchema>;
