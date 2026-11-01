import type { Accent } from "./content";

// Tailwind needs full class names at build time, so accent -> class lookups live here.
export const accentBg: Record<Accent, string> = {
  teal: "bg-teal",
  iris: "bg-iris",
  amber: "bg-amber",
  coral: "bg-coral",
};

export const accentText: Record<Accent, string> = {
  teal: "text-teal",
  iris: "text-iris",
  amber: "text-amber",
  coral: "text-coral",
};

export const accentBorder: Record<Accent, string> = {
  teal: "border-teal/40",
  iris: "border-iris/40",
  amber: "border-amber/40",
  coral: "border-coral/40",
};

export const accentVar: Record<Accent, string> = {
  teal: "var(--teal)",
  iris: "var(--iris)",
  amber: "var(--amber)",
  coral: "var(--coral)",
};

export type Ym = { year: number; month: number };

export const monthIndex = (d: Ym): number => d.year * 12 + (d.month - 1);

export function formatDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y && m) return `${y}y ${m}m`;
  if (y) return `${y}y`;
  return `${m}m`;
}
