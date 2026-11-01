"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { hero, type YearMonth } from "@/lib/content";
import { drawnSpans, periodOf, type DrawnSpan } from "@/lib/visible";
import { accentBg, accentText, formatDuration, monthIndex } from "@/lib/accent";
import { setHighlight, useSceneStore } from "@/lib/sceneStore";
import { useLiveSpans } from "@/lib/liveSpans";

const STAGGER = 0.11;

function currentMonth(): YearMonth {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function TraceHero() {
  const reduce = useReducedMotion();
  const spans = drawnSpans();
  const live = useLiveSpans();
  const [now, setNow] = useState<YearMonth>(hero.fallbackNow);
  // Bars wait for the shared intro clock so they grow while the 3D nodes assemble.
  const introStarted = useSceneStore((s) => s.introStarted);
  const [activeId, setActiveId] = useState<string>(spans[0]?.id ?? "");
  useEffect(() => setNow(currentMonth()), []);

  const axisStart = monthIndex(hero.axisStart);
  const axisEnd = monthIndex(now) + 1;
  const total = axisEnd - axisStart;
  const pct = (m: number) => ((m - axisStart) / total) * 100;

  const years: number[] = [];
  for (let y = hero.axisStart.year + 1; y <= now.year; y++) years.push(y);

  const root = spans[0];
  const rootMonths = root ? monthIndex(root.end === "now" ? now : root.end) - monthIndex(root.start) + 1 : 0;
  const activeLive = live.find((l) => `live-${l.id}` === activeId);
  const active = spans.find((s) => s.id === activeId) ?? (activeLive ? undefined : root);

  const gridlines = years.map((y) => (
    <span
      key={y}
      aria-hidden="true"
      className="absolute inset-y-0 w-px bg-line/60"
      style={{ left: `${pct(monthIndex({ year: y, month: 1 }))}%` }}
    />
  ));

  const metrics = (s: DrawnSpan) => {
    // Clamp to the axis so a span that began before it still draws from the left edge.
    const start = Math.max(monthIndex(s.start), axisStart);
    const end = monthIndex(s.end === "now" ? now : s.end) + 1;
    return { left: pct(start), width: ((end - start) / total) * 100, months: end - start };
  };

  const focusSpan = (id: string) => {
    setActiveId(id);
    setHighlight(id);
  };

  return (
    <section aria-label="Career trace" className="rounded-panel border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs sm:text-sm">
        <span className="rounded-full bg-teal/15 px-2.5 py-0.5 font-medium text-teal">{hero.traceMethod}</span>
        <span className="min-w-0 break-all text-ink">{hero.tracePath}</span>
        <span className="text-teal">{hero.traceStatus}</span>
        <span className="ml-auto text-muted">{formatDuration(rootMonths)}</span>
      </div>

      <div className="mt-5">
        {/* Year axis */}
        <div className="grid sm:grid-cols-[13rem_1fr_4.5rem] sm:gap-x-4" aria-hidden="true">
          <span className="hidden sm:block" />
          <div className="relative h-5 font-mono text-[11px] text-muted">
            {years.map((y) => (
              <span key={y} className="absolute -translate-x-1/2" style={{ left: `${pct(monthIndex({ year: y, month: 1 }))}%` }}>
                {y}
              </span>
            ))}
          </div>
          <span className="hidden sm:block" />
        </div>

        <ul className="mt-1">
          {spans.map((s, i) => {
            const m = metrics(s);
            const isActive = s.id === active?.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onPointerEnter={() => focusSpan(s.id)}
                  onPointerLeave={() => setHighlight(null)}
                  onFocus={() => focusSpan(s.id)}
                  onBlur={() => setHighlight(null)}
                  onClick={() => focusSpan(s.id)}
                  aria-pressed={isActive}
                  className={clsx(
                    "grid w-full gap-x-4 gap-y-1 rounded-lg px-1 py-1.5 text-left transition-colors sm:grid-cols-[13rem_1fr_4.5rem] sm:items-center",
                    isActive ? "bg-bg/60" : "hover:bg-bg/40",
                  )}
                >
                  <span className={clsx("font-mono text-xs leading-snug", isActive ? "text-ink" : "text-muted")}>
                    {s.child && <span aria-hidden="true" className="mr-1.5 text-line">└</span>}
                    {s.label}
                  </span>
                  <span className="relative block h-4">
                    {gridlines}
                    <motion.span
                      className={clsx("absolute top-0.5 h-3 rounded-full", accentBg[s.accent])}
                      style={{ left: `${m.left}%`, minWidth: 6 }}
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: reduce || introStarted ? `${m.width}%` : 0 }}
                      transition={{ duration: 0.7, delay: i * STAGGER, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                  <span className="hidden text-right font-mono text-xs text-muted sm:block">
                    {s.yearOnly ? "" : formatDuration(m.months)}
                  </span>
                </button>
              </li>
            );
          })}
          {live.map((l) => {
            const id = `live-${l.id}`;
            const isActive = id === activeId;
            return (
              <li key={id}>
                <button
                  type="button"
                  onPointerEnter={() => setActiveId(id)}
                  onFocus={() => setActiveId(id)}
                  onClick={() => setActiveId(id)}
                  aria-pressed={isActive}
                  className={clsx(
                    "grid w-full gap-x-4 gap-y-1 rounded-lg px-1 py-1.5 text-left transition-colors sm:grid-cols-[13rem_1fr_4.5rem] sm:items-center",
                    isActive ? "bg-bg/60" : "hover:bg-bg/40",
                  )}
                >
                  <span className={clsx("break-all font-mono text-xs leading-snug", isActive ? "text-ink" : "text-muted")}>
                    <span aria-hidden="true" className="mr-1.5 text-line">└</span>
                    GET {l.path}
                  </span>
                  <span className="relative block h-4">
                    {gridlines}
                    <motion.span
                      aria-hidden="true"
                      className="absolute right-0 top-0.5 h-3 w-2.5 rounded-full border border-dashed border-ink/70"
                      initial={reduce ? false : { scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.25 }}
                    />
                  </span>
                  <span className="hidden text-right font-mono text-xs text-muted sm:block">{l.ms} ms</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 min-h-[5.5rem] rounded-card border border-line bg-bg/50 p-4" aria-live="polite">
        <AnimatePresence mode="wait">
          {activeLive && (
            <motion.div key={`live-${activeLive.id}`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.15 }}>
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="break-all font-mono text-sm text-ink">GET {activeLive.path}</span>
                <span className="font-mono text-xs text-muted">live request</span>
              </p>
              <p className="mt-2 max-w-[65ch] text-sm text-muted">
                Returned {activeLive.status} in {activeLive.ms} ms, measured in your browser.
              </p>
            </motion.div>
          )}
          {active && (
            <motion.div
              key={active.id}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className={clsx("font-mono text-sm", accentText[active.accent])}>{active.label}</span>
                <span className="font-mono text-xs text-muted">{periodOf(active)}</span>
              </p>
              {active.detail && <p className="mt-2 max-w-[65ch] text-sm text-muted">{active.detail}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-3 text-sm text-muted">{hero.traceCaption}</p>
      <p className="mt-1 text-sm text-muted">{hero.beforeTrace}</p>
    </section>
  );
}
