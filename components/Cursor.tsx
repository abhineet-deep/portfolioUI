"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const INTERACTIVE = 'a[href], button, [role="button"], [role="switch"], summary, label[for], [data-cursor]';
const TEXT_INPUT = 'input, textarea, select, [contenteditable="true"]';

const DEFAULT_LABEL: Record<string, string> = { A: "open" };

/**
 * A ring that trails the pointer over interactive elements, with a tiny label where it helps
 * (data-cursor="copy|open|drag|run|select"). The native cursor is never hidden, and nothing
 * shows over text or inputs. Fine pointers only.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [over, setOver] = useState<{ on: boolean; label: string }>({ on: false, label: "" });
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 36, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 36, mass: 0.4 });

  useEffect(() => {
    const q = window.matchMedia("(pointer: fine) and (hover: hover)");
    const sync = () => setEnabled(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      if (reduce) {
        sx.jump(e.clientX);
        sy.jump(e.clientY);
      }
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t || t.closest(TEXT_INPUT)) return setOver({ on: false, label: "" });
      const el = t.closest<HTMLElement>(INTERACTIVE);
      if (!el) return setOver({ on: false, label: "" });
      setOver({ on: true, label: el.dataset.cursor ?? DEFAULT_LABEL[el.tagName] ?? "" });
    };
    const leave = () => setOver({ on: false, label: "" });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, reduce, x, y, sx, sy]);

  if (!enabled) return null;

  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ x: sx, y: sy }}>
      <motion.div
        className="-ml-5 -mt-5 grid h-10 w-10 place-items-center rounded-full border border-ink/50"
        initial={false}
        animate={{ opacity: over.on ? 1 : 0, scale: over.on ? 1 : 0.4 }}
        transition={{ duration: reduce ? 0 : 0.18 }}
      />
      {over.on && over.label && (
        <span className="absolute left-6 top-4 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] leading-none text-bg">
          {over.label}
        </span>
      )}
    </motion.div>
  );
}
