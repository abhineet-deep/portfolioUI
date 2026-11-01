"use client";

import { nav, site } from "@/lib/content";
import { openPalette } from "@/lib/scroll";
import { KeyHint } from "./KeyHint";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className="flex w-full max-w-xl items-center justify-between gap-2 rounded-full border border-line bg-surface/70 py-1.5 pl-5 pr-2 backdrop-blur-md"
      >
        <a href="#" className="font-mono text-sm font-medium text-ink" aria-label="Back to top">
          {site.monogram}
        </a>
        <ul className="hidden items-center gap-6 text-sm text-muted md:flex">
          {nav.links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className="transition-colors hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            className="flex h-9 items-center rounded-full border border-line px-3 font-mono text-xs text-muted transition-colors hover:text-ink"
          >
            <KeyHint />
          </button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
