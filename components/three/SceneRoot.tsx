"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor, View } from "@react-three/drei";
import { sceneStore, useSceneStore, type SlotName } from "@/lib/sceneStore";
import { GatewayMini } from "./GatewayMini";
import { HeroArchitecture } from "./HeroArchitecture";
import { MonogramToy } from "./MonogramToy";
import { useReducedMotion3D } from "./useReducedMotion3D";

/**
 * With frameloop="demand" nothing renders unless asked. This asks for a frame every tick while a
 * visible scene is animating, and once on scroll/resize so static scenes stay glued to their slots.
 */
function FrameDriver({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    const animating = () => {
      const s = sceneStore.get();
      if (reduced || document.hidden) return false;
      return !!s.visible.hero || (!!s.visible.gateway && !!s.engaged.gateway) || (!mobile && !!s.visible.monogram && !!s.engaged.monogram);
    };
    const loop = () => {
      if (animating()) invalidate();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const once = () => invalidate();
    window.addEventListener("scroll", once, { passive: true });
    window.addEventListener("resize", once);
    document.addEventListener("visibilitychange", once);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", once);
      window.removeEventListener("resize", once);
      document.removeEventListener("visibilitychange", once);
    };
  }, [invalidate, reduced, mobile]);
  return null;
}

export default function SceneRoot() {
  const { reduced, mobile } = useReducedMotion3D();
  const slots = useSceneStore((s) => s.slots);
  const monogramVisible = useSceneStore((s) => !!s.visible.monogram);
  const [dpr, setDpr] = useState(1.75);

  const tracks = useMemo(() => {
    const out: Partial<Record<SlotName, { current: HTMLElement }>> = {};
    (Object.keys(slots) as SlotName[]).forEach((k) => {
      const el = slots[k];
      if (el) out[k] = { current: el };
    });
    return out;
  }, [slots]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40">
      <Canvas
        frameloop="demand"
        dpr={dpr}
        eventSource={document.body}
        eventPrefix="client"
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
        <FrameDriver reduced={reduced} mobile={mobile} />
        {tracks.hero && slots.hero && (
          <View track={tracks.hero}>
            <HeroArchitecture slot={slots.hero} mobile={mobile} reduced={reduced} />
          </View>
        )}
        {tracks.gateway && slots.gateway && (
          <View track={tracks.gateway}>
            <GatewayMini reduced={reduced} />
          </View>
        )}
        {!mobile && monogramVisible && tracks.monogram && slots.monogram && (
          <View track={tracks.monogram}>
            <MonogramToy slot={slots.monogram} reduced={reduced} />
          </View>
        )}
      </Canvas>
    </div>
  );
}
