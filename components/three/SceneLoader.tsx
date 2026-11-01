"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { startIntro } from "@/lib/sceneStore";

// The whole three.js chunk loads on demand, and only after hydration + idle.
const SceneRoot = dynamic(() => import("./SceneRoot"), { ssr: false });

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Mounts the shared 3D canvas once the page is idle. Without WebGL the static fallbacks stay. */
export function SceneLoader() {
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (!hasWebGL()) {
      startIntro();
      return;
    }
    // If the 3D chunk is slow, don't hold the trace bars hostage.
    const giveUp = setTimeout(startIntro, 2500);
    const hasIdle = "requestIdleCallback" in window;
    const idle = hasIdle
      ? window.requestIdleCallback(() => setGo(true), { timeout: 1500 })
      : window.setTimeout(() => setGo(true), 300);
    return () => {
      clearTimeout(giveUp);
      if (hasIdle) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, []);

  return go ? <SceneRoot /> : null;
}
