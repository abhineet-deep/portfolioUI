import { experience, projects, site, stack } from "@/lib/content";

/** Drops undefined, null, empty strings, empty arrays and empty objects, recursively. */
export function compact<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(compact).filter((v) => !isEmpty(v)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const c = compact(v);
      if (!isEmpty(c)) out[k] = c;
    }
    return out as T;
  }
  return value;
}

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null || v === "") return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v as object).length === 0;
  return false;
}

export function projectList() {
  return Object.values(projects).map((p) =>
    compact({ slug: p.id, title: p.title, status: p.status, description: p.description, tags: p.tags, href: p.href }),
  );
}

export function buildProfile() {
  return compact({
    name: site.name,
    headline: site.role,
    summary: site.summary,
    contact: { email: site.email, github: site.github, linkedin: site.linkedin },
    experience: experience.jobs.map((j) => ({ org: j.org, role: j.role, period: j.period, description: j.description })),
    certifications: experience.certs,
    stack,
    projects: Object.values(projects).map((p) => ({ slug: p.id, title: p.title })),
  });
}
