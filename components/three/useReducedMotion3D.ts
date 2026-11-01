"use client";

import { useEffect, useState } from "react";

export type SceneFlags = { reduced: boolean; mobile: boolean };

export function readFlags(): SceneFlags {
  if (typeof window === "undefined") return { reduced: false, mobile: false };
  return {
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    mobile: window.matchMedia("(max-width: 767px), (pointer: coarse)").matches,
  };
}

/** Reduced-motion and mobile/touch detection, kept live. */
export function useReducedMotion3D(): SceneFlags {
  const [flags, setFlags] = useState<SceneFlags>(readFlags);
  useEffect(() => {
    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(max-width: 767px), (pointer: coarse)"),
    ];
    const update = () => setFlags(readFlags());
    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);
  return flags;
}
