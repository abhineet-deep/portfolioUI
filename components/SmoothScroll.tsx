"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { scrollRegistry } from "@/lib/scroll";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1 });
    scrollRegistry.lenis = lenis;

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") {
        e.preventDefault();
        lenis.scrollTo(0);
        return;
      }
      const el = document.getElementById(hash.slice(1));
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -80 });
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      scrollRegistry.lenis = null;
    };
  }, []);

  return null;
}
