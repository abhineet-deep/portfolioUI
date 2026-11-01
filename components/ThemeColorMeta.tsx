"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const COLORS = { dark: "#0F1522", light: "#F2F4F9" };

/**
 * The viewport meta tags follow the OS color scheme. The page theme can be switched by hand, so keep
 * the browser UI color in step with whatever theme is actually showing.
 */
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === "light" ? COLORS.light : COLORS.dark;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", color));
  }, [resolvedTheme]);
  return null;
}
