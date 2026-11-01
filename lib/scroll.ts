import type Lenis from "lenis";

type Registry = { lenis: Lenis | null };

/** Shared handle so helpers outside React can reach the Lenis instance. */
export const scrollRegistry: Registry = { lenis: null };

export const TOAST_EVENT = "app:toast";
export const PALETTE_EVENT = "app:open-palette";

const OFFSET = -80;

export function scrollToId(id: string): void {
  if (id === "top") {
    if (scrollRegistry.lenis) scrollRegistry.lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  if (scrollRegistry.lenis) {
    scrollRegistry.lenis.scrollTo(el, { offset: OFFSET });
  } else {
    el.scrollIntoView({ behavior: "auto", block: "start" });
  }
  history.replaceState(null, "", id === "top" ? "#" : `#${id}`);
}

export function toast(message: string): void {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}

export async function copyEmail(email: string, message: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(email);
    toast(message);
  } catch {
    toast("Couldn't copy. Select the address manually.");
  }
}

export function openPalette(): void {
  window.dispatchEvent(new Event(PALETTE_EVENT));
}
