"use client";

import { useSyncExternalStore } from "react";

export type SlotName = "hero" | "gateway" | "monogram";

/** A text label drawn as plain DOM over a slot. x/y are 0..1 within the slot (y downward). */
export type SceneLabel = {
  id: string;
  text: string;
  sub?: string;
  x: number;
  y: number;
  variant: "pill" | "tag";
  tone?: "muted" | "coral";
};

export type SceneState = {
  /** DOM placeholders the shared canvas draws into. */
  slots: Partial<Record<SlotName, HTMLElement>>;
  visible: Partial<Record<SlotName, boolean>>;
  /** Hover/focus state for slots that only animate when engaged. */
  engaged: Partial<Record<SlotName, boolean>>;
  /** True once a scene has drawn its first frame. */
  ready: Partial<Record<SlotName, boolean>>;
  labels: Partial<Record<SlotName, SceneLabel[]>>;
  /** Trace span currently hovered/focused, drives node highlights. */
  highlight: string | null;
  /** Gate for the single load animation (trace bars + node assembly). */
  introStarted: boolean;
};

let state: SceneState = { slots: {}, visible: {}, engaged: {}, ready: {}, labels: {}, highlight: null, introStarted: false };
const listeners = new Set<() => void>();

function set(patch: Partial<SceneState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const sceneStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export function useSceneStore<T>(select: (s: SceneState) => T): T {
  return useSyncExternalStore(
    sceneStore.subscribe,
    () => select(state),
    () => select(state),
  );
}

export function registerSlot(name: SlotName, el: HTMLElement | null) {
  const slots = { ...state.slots };
  if (el) slots[name] = el;
  else delete slots[name];
  set({ slots });
}
export const setVisible = (name: SlotName, v: boolean) => {
  if (!!state.visible[name] !== v) set({ visible: { ...state.visible, [name]: v } });
};
export const setEngaged = (name: SlotName, v: boolean) => {
  if (!!state.engaged[name] !== v) set({ engaged: { ...state.engaged, [name]: v } });
};
export const setLabels = (name: SlotName, labels: SceneLabel[]) => set({ labels: { ...state.labels, [name]: labels } });
export const markReady = (name: SlotName) => {
  if (!state.ready[name]) set({ ready: { ...state.ready, [name]: true } });
};
export const setHighlight = (id: string | null) => {
  if (state.highlight !== id) set({ highlight: id });
};
// The load sequence (trace bars + 3D node assembly) starts once the scene is ready (or gave up
// waiting) AND the optional first-visit boot strip has finished.
let sceneWants = false;
let bootHeld = false;
const maybeStart = () => {
  if (sceneWants && !bootHeld && !state.introStarted) set({ introStarted: true });
};
export const startIntro = () => {
  sceneWants = true;
  maybeStart();
};
export const holdIntro = () => {
  bootHeld = true;
};
export const releaseIntro = () => {
  bootHeld = false;
  maybeStart();
};
