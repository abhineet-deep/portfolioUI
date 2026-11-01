"use client";

import { useEffect, useState } from "react";
import { Color, SRGBColorSpace } from "three";

export type ThemeColors = {
  dark: boolean;
  bg: Color;
  surface: Color;
  line: Color;
  ink: Color;
  muted: Color;
  teal: Color;
  amber: Color;
  coral: Color;
  iris: Color;
};

const TOKENS = ["bg", "surface", "line", "ink", "muted", "teal", "amber", "coral", "iris"] as const;

function read(): ThemeColors {
  const css = getComputedStyle(document.documentElement);
  const out = { dark: !document.documentElement.classList.contains("light") } as ThemeColors;
  for (const t of TOKENS) {
    // Tokens hold space-separated RGB channels, e.g. "61 214 198".
    const [r = 0, g = 0, b = 0] = css.getPropertyValue(`--${t}`).trim().split(/\s+/).map(Number);
    out[t] = new Color().setRGB(r / 255, g / 255, b / 255, SRGBColorSpace);
  }
  return out;
}

/** Site colors as THREE.Colors, re-read whenever next-themes flips the class on <html>. */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setColors(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return colors;
}
