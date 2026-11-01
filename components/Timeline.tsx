"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { experience } from "@/lib/content";
import { Reveal } from "./Reveal";

export function Timeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  return (
    <section id={experience.id} className="scroll-mt-24 py-24">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{experience.heading}</h2>
      </Reveal>

      <ol ref={listRef} className="relative mt-12 space-y-12 pl-10 sm:pl-14">
        <span aria-hidden="true" className="absolute bottom-2 left-[11px] top-2 w-px bg-line sm:left-[15px]" />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-2 left-[11px] top-2 w-px origin-top bg-teal sm:left-[15px]"
          style={{ scaleY: reduce ? 1 : progress }}
        />
        {experience.jobs.map((job, i) => (
          <li key={`${job.org}-${i}`} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-10 top-0 grid h-6 w-6 place-items-center rounded-full border border-teal bg-bg font-mono text-[11px] text-teal sm:-left-14 sm:h-8 sm:w-8 sm:text-xs"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {job.period && <p className="font-mono text-sm text-muted">{job.period}</p>}
            <h3 className="mt-1 text-xl font-semibold">{job.org}</h3>
            {job.role && <p className="text-teal">{job.role}</p>}
            {job.description && <p className="mt-2 max-w-[65ch] text-muted">{job.description}</p>}
          </li>
        ))}
      </ol>

      <div className="mt-16">
        <h3 className="text-lg font-semibold">{experience.certsHeading}</h3>
        <ul className="mt-4 flex flex-wrap gap-2">
          {experience.certs.map((c) => (
            <li
              key={c.name}
              className="rounded-full border border-amber/40 bg-amber/10 px-3.5 py-1.5 text-sm text-ink"
            >
              {c.name} <span className="font-mono text-xs text-amber">{c.year}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
