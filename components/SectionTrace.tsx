"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, type MotionValue } from "framer-motion";
import clsx from "clsx";
import { nav, type Accent } from "@/lib/content";
import { accentBg } from "@/lib/accent";
import { scrollToId } from "@/lib/scroll";

// Same meaning as the trace: coral = projects, teal = jobs, iris = overall.
const ACCENT: Record<string, Accent> = { projects: "coral", experience: "teal", contact: "iris" };

function Bar({ id, label, el }: { id: string; label: string; el: HTMLElement }) {
  const { scrollYProgress } = useScroll({ target: { current: el }, offset: ["start 80%", "end 40%"] });
  const [reading, setReading] = useState(false);
  const [pct, setPct] = useState(0);
  const accent = accentBg[ACCENT[id] ?? "iris"];

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setReading(v > 0 && v < 1);
    setPct(Math.round(Math.min(1, Math.max(0, v)) * 100));
  });

  const fill = (v: MotionValue<number>, axis: "x" | "y") => (
    <motion.span
      aria-hidden="true"
      className={clsx(
        "absolute inset-0",
        accent,
        axis === "x" ? "origin-left min-[1400px]:hidden" : "hidden origin-top min-[1400px]:block",
      )}
      style={axis === "x" ? { scaleX: v } : { scaleY: v }}
    />
  );

  return (
    <button
      type="button"
      onClick={() => scrollToId(id)}
      aria-label={`${label}, ${pct}% read. Go to section.`}
      data-cursor="open"
      className="flex flex-1 flex-col gap-1 text-left min-[1400px]:flex-none min-[1400px]:flex-row min-[1400px]:items-center min-[1400px]:gap-2"
    >
      <span className={clsx("font-mono text-[10px] leading-none transition-colors min-[1400px]:order-2", reading ? "text-ink" : "text-muted")}>{label}</span>
      <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-line min-[1400px]:order-1 min-[1400px]:h-16 min-[1400px]:w-[3px]">
        {fill(scrollYProgress, "x")}
        {fill(scrollYProgress, "y")}
      </span>
    </button>
  );
}

/**
 * Once the hero is behind you, a slim trace of the page appears: one bar per section that fills as
 * you read it. It sits in the left margin on wide screens and under the nav on narrow ones.
 */
export function SectionTrace() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [els, setEls] = useState<{ id: string; label: string; el: HTMLElement }[]>([]);

  useEffect(() => {
    setEls(
      nav.links.flatMap((l) => {
        const el = document.getElementById(l.id);
        return el ? [{ id: l.id, label: l.label, el }] : [];
      }),
    );
    const hero = document.getElementById("hero");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShow(!!e && !e.isIntersecting && e.boundingClientRect.bottom < 0));
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {show && els.length > 0 && (
        <motion.nav
          aria-label="Page sections"
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 top-[4.6rem] z-[45] flex justify-center px-4 min-[1400px]:inset-x-auto min-[1400px]:left-5 min-[1400px]:top-1/2 min-[1400px]:-translate-y-1/2 min-[1400px]:px-0"
        >
          <div className="flex w-full max-w-xl gap-4 rounded-full border border-line bg-surface/70 px-5 py-2 backdrop-blur-md min-[1400px]:w-auto min-[1400px]:flex-col min-[1400px]:gap-5 min-[1400px]:rounded-none min-[1400px]:border-0 min-[1400px]:bg-transparent min-[1400px]:p-0 min-[1400px]:backdrop-blur-none">
            {els.map((e) => (
              <Bar key={e.id} {...e} />
            ))}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
