"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { hero } from "@/lib/content";
import { holdIntro, releaseIntro } from "@/lib/sceneStore";

const KEY = "portfolio-booted";
const COMMAND = `$ curl ${hero.tracePath}`;
const TYPE_MS = 16;

/**
 * First visit of a session only: a one-line terminal strip types the request that the trace below
 * represents. When it resolves it releases the shared intro, so the trace bars and 3D nodes then
 * run as the same single load sequence. The headline is in the HTML from the start and the strip is
 * absolutely positioned, so it can't delay LCP or shift layout. Skipped on repeat visits and with
 * reduced motion.
 */
export function Boot() {
  const [text, setText] = useState("");
  const [ok, setOk] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let skip = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      if (window.sessionStorage.getItem(KEY)) skip = true;
    } catch {
      skip = true;
    }
    if (skip) return;

    holdIntro();
    setShow(true);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i = 0;
    const type = () => {
      i++;
      setText(COMMAND.slice(0, i));
      if (i < COMMAND.length) timers.push(setTimeout(type, TYPE_MS));
      else {
        timers.push(setTimeout(() => setOk(true), 120));
        timers.push(setTimeout(() => setShow(false), 560));
        timers.push(
          setTimeout(() => {
            // Marked done only once it has played, so a reload mid-boot still shows it.
            try {
              window.sessionStorage.setItem(KEY, "1");
            } catch {
              /* storage unavailable */
            }
            releaseIntro();
          }, 620),
        );
      }
    };
    timers.push(setTimeout(type, 60));
    return () => {
      timers.forEach(clearTimeout);
      releaseIntro();
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.p
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none absolute left-0 top-24 font-mono text-xs text-muted sm:top-[7.25rem] sm:text-sm"
        >
          <span className="text-teal">{text.slice(0, 1)}</span>
          {text.slice(1)}
          {ok && <span className="text-teal"> … {hero.traceStatus}</span>}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
