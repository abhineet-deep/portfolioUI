"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { stackGroups, stackSection } from "@/lib/content";
import { Reveal } from "./Reveal";

/**
 * Compact grouped view of the stack with filter chips. Hovering, focusing or selecting a chip
 * sets data-stack-group on <html>; globals.css uses that to highlight the group in the marquee.
 */
export function StackGroups() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const id = hover ?? selected;
    const root = document.documentElement;
    if (id) root.dataset.stackGroup = id;
    else delete root.dataset.stackGroup;
    return () => {
      delete root.dataset.stackGroup;
    };
  }, [hover, selected]);

  const shown = selected ? stackGroups.filter((g) => g.id === selected) : stackGroups;
  const chip = "rounded-full border px-3.5 py-1.5 text-sm transition-colors";

  return (
    <section id="stack" aria-labelledby="stack-heading" className="scroll-mt-24 py-16">
      <Reveal>
        <h2 id="stack-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {stackSection.heading}
        </h2>
      </Reveal>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by area">
        <button
          type="button"
          aria-pressed={selected === null}
          onClick={() => setSelected(null)}
          className={clsx(chip, selected === null ? "border-ink bg-ink text-bg" : "border-line text-muted hover:text-ink")}
        >
          {stackSection.all}
        </button>
        {stackGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={selected === g.id}
            onClick={() => setSelected(selected === g.id ? null : g.id)}
            onPointerEnter={() => setHover(g.id)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(g.id)}
            onBlur={() => setHover(null)}
            className={clsx(chip, selected === g.id ? "border-ink bg-ink text-bg" : "border-line text-muted hover:text-ink")}
          >
            {g.label}
          </button>
        ))}
      </div>

      <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((g) => (
          <div key={g.id}>
            <dt className="text-sm font-medium text-ink">{g.label}</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {g.items.map((item) => (
                <span key={item} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-xs text-muted">
                  {item}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
