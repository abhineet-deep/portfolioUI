"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import clsx from "clsx";
import type { Accent } from "@/lib/content";
import { accentVar } from "@/lib/accent";

type Props = {
  accent: Accent;
  label: string;
  className?: string;
  /** Tilt toward the cursor. Off for cards that host a 3D scene, which can't tilt with them. */
  tilt?: boolean;
  children: React.ReactNode;
};

const MAX_TILT = 4; // degrees
const SPRING = { stiffness: 220, damping: 22, mass: 0.5 };

export function SpotlightCard({ accent, label, className, tilt = true, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, SPRING);
  const sy = useSpring(ry, SPRING);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
    if (tilt && !reduce) {
      ry.set((x / r.width - 0.5) * 2 * MAX_TILT);
      rx.set(-(y / r.height - 0.5) * 2 * MAX_TILT);
    }
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      role="group"
      aria-label={label}
      tabIndex={0}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ "--spot": accentVar[accent], rotateX: sx, rotateY: sy, transformPerspective: 900 } as unknown as React.CSSProperties}
      className={clsx(
        "group relative overflow-hidden rounded-card border border-line bg-surface p-6 sm:p-7 will-change-transform",
        className,
      )}
    >
      {/* Spotlight and 1px border share the same cursor position, so they read as one effect. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(320px circle at var(--x, 50%) var(--y, 50%), rgb(var(--spot) / 0.16), transparent 70%)" }}
      />
      <div aria-hidden="true" className="card-border" />
      <div className="relative flex h-full flex-col">{children}</div>
    </motion.div>
  );
}
