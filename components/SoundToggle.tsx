"use client";

import { toggleSound, useSoundEnabled } from "@/lib/sound";

/** Off by default. The preference is saved in localStorage. */
export function SoundToggle() {
  const on = useSoundEnabled();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Interface sounds"
      onClick={toggleSound}
      className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:text-ink"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
        {on ? <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /> : <path d="M16 9.5l4 5M20 9.5l-4 5" />}
      </svg>
    </button>
  );
}
