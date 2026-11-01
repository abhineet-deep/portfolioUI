import { traceSpans, type TraceSpan, type YearMonth } from "./content";

/** A span that has everything needed to be drawn. */
export type DrawnSpan = TraceSpan & { start: YearMonth; end: YearMonth | "now" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (d: YearMonth) => `${MONTHS[d.month - 1] ?? ""} ${d.year}`;

/** Spans with missing dates are hidden, never guessed. */
export function drawnSpans(): DrawnSpan[] {
  return traceSpans.filter((s): s is DrawnSpan => !!s.start && !!s.end);
}

export function periodOf(s: DrawnSpan): string {
  if (s.period) return s.period;
  return `${fmt(s.start)} – ${s.end === "now" ? "now" : fmt(s.end)}`;
}
