"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Mask reveal for a section heading: the heading slides up out of a clipped box, once, the first
 * time it scrolls into view. Wrapping the whole block (rather than splitting lines) means it can't
 * mis-wrap at any width. Reduced motion renders the heading as-is.
 */
export function Reveal({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    // Bottom padding keeps descenders from being clipped by the mask.
    <div className="-mb-2 overflow-hidden pb-2">
      <motion.div
        initial={{ y: "108%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
