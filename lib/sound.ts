"use client";

import { useSyncExternalStore } from "react";

// Tiny UI sounds generated with Web Audio: no audio files. Off by default; the choice is saved.

const KEY = "portfolio-sound";
let enabled = false;
let loaded = false;
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    enabled = window.localStorage.getItem(KEY) === "on";
  } catch {
    enabled = false;
  }
}

export function setSoundEnabled(on: boolean) {
  load();
  enabled = on;
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable: keep it for this visit only */
  }
  listeners.forEach((l) => l());
  if (on) playSound("on");
}

export const toggleSound = () => {
  load();
  setSoundEnabled(!enabled);
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** False on the server and on first client render, so there is nothing to mismatch. */
export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return enabled;
    },
    () => false,
  );
}

type Tone = { f: number; t: number; d: number; type?: OscillatorType; g?: number };
const SOUNDS = {
  open: [{ f: 520, t: 0, d: 0.07 }, { f: 780, t: 0.05, d: 0.09 }],
  copy: [{ f: 660, t: 0, d: 0.06 }, { f: 990, t: 0.07, d: 0.1 }],
  run: [{ f: 440, t: 0, d: 0.05, type: "triangle" }],
  toggle: [{ f: 300, t: 0, d: 0.05, type: "triangle" }],
  on: [{ f: 600, t: 0, d: 0.06 }, { f: 900, t: 0.06, d: 0.08 }],
} satisfies Record<string, Tone[]>;

export type SoundName = keyof typeof SOUNDS;

export function playSound(name: SoundName) {
  load();
  if (!enabled || typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime;
  for (const tone of SOUNDS[name] as Tone[]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone.type ?? "sine";
    osc.frequency.value = tone.f;
    // Quick attack and exponential release: a soft click rather than a beep.
    const peak = tone.g ?? 0.05;
    gain.gain.setValueAtTime(0.0001, now + tone.t);
    gain.gain.exponentialRampToValueAtTime(peak, now + tone.t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.t + tone.d);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + tone.t);
    osc.stop(now + tone.t + tone.d + 0.02);
  }
}
