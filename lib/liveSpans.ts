"use client";

import { useSyncExternalStore } from "react";

/** A real request made from the terminal, shown as a live span in the hero trace. */
export type LiveSpan = { id: number; path: string; status: number; ms: number };

const KEEP = 3;
let spans: LiveSpan[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

export function addLiveSpan(s: Omit<LiveSpan, "id">) {
  spans = [...spans, { ...s, id: nextId++ }].slice(-KEEP);
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const empty: LiveSpan[] = [];

export function useLiveSpans(): LiveSpan[] {
  return useSyncExternalStore(subscribe, () => spans, () => empty);
}
