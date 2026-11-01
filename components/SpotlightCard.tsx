"use client";

import { useRef } from "react";
import clsx from "clsx";
import type { Accent } from "@/lib/content";
import { accentVar } from "@/lib/accent";

type Props = {
  accent: Accent;
  label: string;
  className?: string;
  children: React.ReactNode;
};

export function SpotlightCard({ accent, label, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      tabIndex={0}
      onPointerMove={onMove}
      style={{ "--spot": accentVar[accent] } as React.CSSProperties}
      className={clsx(
        "group relative overflow-hidden rounded-card border border-line bg-surface p-6 sm:p-7",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(320px circle at var(--x, 50%) var(--y, 50%), rgb(var(--spot) / 0.16), transparent 70%)" }}
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
}
