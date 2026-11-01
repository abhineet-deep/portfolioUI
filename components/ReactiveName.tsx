"use client";

import { useEffect, useRef } from "react";

const REST = { wght: 320, wdth: 78 };
const PEAK = { wght: 800, wdth: 100 };
const FALLOFF = 260;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Headline whose letters swell toward the cursor. The resting style lives in CSS (.rname-letter)
 * so touch and reduced-motion users get a static heavy weight with no flash.
 */
export function ReactiveName({ name }: { name: string }) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const words = name.split(" ");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    if (reduce || noHover) return;

    const letters = Array.from(root.querySelectorAll<HTMLElement>("[data-letter]"));
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      for (const el of letters) {
        let t = 0;
        if (pointer) {
          const r = el.getBoundingClientRect();
          const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
          t = Math.max(0, 1 - d / FALLOFF);
        }
        const wght = Math.round(lerp(REST.wght, PEAK.wght, t));
        const wdth = Math.round(lerp(REST.wdth, PEAK.wdth, t));
        el.style.fontVariationSettings = `"wght" ${wght}, "wdth" ${wdth}`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <h1
      ref={rootRef}
      aria-label={name}
      className="text-[clamp(3.5rem,12vw,10rem)] leading-[0.95] tracking-tight"
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden="true">
          {word.split("").map((ch, i) => (
            <span key={i} data-letter className="rname-letter inline-block">
              {ch}
            </span>
          ))}
          {wi < words.length - 1 && " "}
        </span>
      ))}
    </h1>
  );
}
