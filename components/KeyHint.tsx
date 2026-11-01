"use client";

import { useEffect, useState } from "react";

/** "⌘K" on Apple platforms, "Ctrl K" elsewhere. Renders a blank placeholder until mounted to avoid hydration mismatch. */
export function KeyHint() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => setLabel(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K"), []);
  return <span className="inline-block min-w-[2.5ch]">{label ?? " "}</span>;
}
