"use client";

import { openPalette } from "@/lib/scroll";
import { KeyHint } from "./KeyHint";

export function HeroActions({ primary, palette }: { primary: string; palette: string }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <a
        href="#projects"
        className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
      >
        {primary}
      </a>
      <button
        type="button"
        onClick={openPalette}
        className="flex items-center gap-2.5 rounded-full border border-line px-5 py-3 text-sm text-muted transition-colors hover:text-ink"
      >
        {palette}
        <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-xs">
          <KeyHint />
        </kbd>
      </button>
    </div>
  );
}
