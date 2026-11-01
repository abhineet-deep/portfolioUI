"use client";

import { useEffect, useState } from "react";

/**
 * "⌘K" in the server HTML; swaps to "Ctrl K" after mount on non-Apple platforms.
 * The width is reserved for the longer label so the swap doesn't shift the layout.
 */
export function KeyHint() {
  const [label, setLabel] = useState("⌘K");
  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setLabel("Ctrl K");
  }, []);
  return <span className="inline-block min-w-[5.5ch] text-center">{label}</span>;
}
