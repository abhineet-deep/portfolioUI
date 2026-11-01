"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { registerSlot, setEngaged, setLabels, setVisible, useSceneStore, type SlotName } from "@/lib/sceneStore";

type Props = {
  name: SlotName;
  className?: string;
  /** Static stand-in shown until (or instead of) the 3D scene. */
  fallback: React.ReactNode;
  /** Animate only while the nearest `.group` ancestor (a card) is hovered or focused. */
  engageOnParent?: boolean;
  /** Label shown by the custom cursor over this slot (see Cursor). */
  cursor?: string;
};

/** Placeholder the shared canvas draws into. Decorative, so hidden from assistive tech. */
export function SceneSlot({ name, className, fallback, engageOnParent, cursor }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useSceneStore((s) => !!s.ready[name]);
  const labels = useSceneStore((s) => s.labels[name]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerSlot(name, el);
    const io = new IntersectionObserver(([entry]) => setVisible(name, !!entry?.isIntersecting), { rootMargin: "80px" });
    io.observe(el);

    const card = engageOnParent ? el.closest<HTMLElement>(".group") : null;
    const on = () => setEngaged(name, true);
    const off = () => setEngaged(name, false);
    card?.addEventListener("pointerenter", on);
    card?.addEventListener("pointerleave", off);
    card?.addEventListener("focusin", on);
    card?.addEventListener("focusout", off);

    return () => {
      io.disconnect();
      card?.removeEventListener("pointerenter", on);
      card?.removeEventListener("pointerleave", off);
      card?.removeEventListener("focusin", on);
      card?.removeEventListener("focusout", off);
      registerSlot(name, null);
      setVisible(name, false);
      setLabels(name, []);
    };
  }, [name, engageOnParent]);

  return (
    <div ref={ref} aria-hidden="true" data-cursor={cursor} className={className}>
      <div className={clsx("absolute inset-0 transition-opacity duration-500", ready && "opacity-0")}>{fallback}</div>
      {labels?.map((l) => (
        <span
          key={l.id}
          className={clsx(
            "pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap",
            l.variant === "pill"
              ? "rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink"
              : clsx("font-mono text-[10px]", l.tone === "coral" ? "text-coral" : "text-muted"),
          )}
          style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%` }}
        >
          {l.variant === "pill" ? (
            <>
              <span className="font-medium">{l.text}</span>
              {l.sub && <span className="text-muted"> — {l.sub}</span>}
            </>
          ) : (
            l.text
          )}
        </span>
      ))}
    </div>
  );
}
