"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { easing } from "maath";
import { Color, MathUtils, Vector3, type Group, type MeshBasicMaterial, type MeshStandardMaterial } from "three";
import { archEdges, archNodes, archRoutes, spanHighlight, type ArchNode } from "@/lib/architecture";
import { markReady, sceneStore, setLabels, startIntro, useSceneStore } from "@/lib/sceneStore";
import { buildCurves, routeCurves } from "./graph";
import { toSlot } from "./project";
import { Packets } from "./Packets";
import { rimShader } from "./rim";
import { SharedLights } from "./SharedLights";
import { useThemeColors } from "./useThemeColors";

type Props = { slot: HTMLElement; mobile: boolean; reduced: boolean };

const FOV = 35;
const MAX_TILT = (8 * Math.PI) / 180;
const INTRO_STAGGER = 0.07;
const INTRO_NODE = 0.8;
const PACKETS_AFTER = 1.25;

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

// Deterministic scatter so the assembly looks the same every load.
function scatter(i: number): Vector3 {
  const a = i * 2.399963;
  const r = 4.5 + (i % 3);
  return new Vector3(Math.cos(a) * r, Math.sin(a * 1.3) * r * 0.6, ((i * 37) % 7) - 3);
}

type NodeState = { lit: number; near: number; hover: number };

function Body({ kind, children }: { kind: ArchNode["kind"]; children: React.ReactNode }) {
  switch (kind) {
    case "box":
      return <RoundedBox args={[1.2, 0.85, 0.85]} radius={0.14} smoothness={3}>{children}</RoundedBox>;
    case "smallbox":
      return <RoundedBox args={[0.75, 0.75, 0.75]} radius={0.12} smoothness={3}>{children}</RoundedBox>;
    case "cylinder":
      return <mesh><cylinderGeometry args={[0.45, 0.45, 0.85, 14]} />{children}</mesh>;
    case "torus":
      return <mesh rotation={[Math.PI / 2.4, 0, 0]}><torusGeometry args={[0.45, 0.17, 8, 18]} />{children}</mesh>;
    case "octa":
      return <mesh><octahedronGeometry args={[0.62]} />{children}</mesh>;
    default:
      return <mesh><icosahedronGeometry args={[0.6, 0]} />{children}</mesh>;
  }
}

export function HeroArchitecture({ slot, mobile, reduced }: Props) {
  const colors = useThemeColors();
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  const labelAt = useRef({ x: -1, y: -1 });
  const hoverRef = useRef<string | null>(null);
  // R3F's own pointer isn't updated inside a shared View, so track the cursor directly.
  const cursor = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cursor.current = e.pointerType === "touch" ? null : { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      cursor.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const nodes = useMemo(() => archNodes.filter((n) => !mobile || n.mobile), [mobile]);
  const edges = useMemo(() => {
    const ids = new Set(nodes.map((n) => n.id));
    return archEdges.filter(([a, b]) => ids.has(a) && ids.has(b));
  }, [nodes]);
  const curves = useMemo(() => buildCurves(nodes, edges), [nodes, edges]);

  const highlight = useSceneStore((s) => s.highlight);
  const rerouted = highlight ? spanHighlight[highlight]?.reroute === true : false;
  const routes = useMemo(
    () => routeCurves(rerouted ? archRoutes.llm : archRoutes.default, curves),
    [rerouted, curves],
  );

  // Per-node render objects. Uniform holders are stable so colors can be updated in place.
  const rigs = useMemo(
    () =>
      nodes.map(() => ({
        rim: { value: new Color() },
        k: { value: 1 },
      })),
    [nodes],
  );
  const matRefs = useRef<(MeshStandardMaterial | null)[]>([]);
  const groupRefs = useRef<(Group | null)[]>([]);
  const tubeRefs = useRef<(MeshBasicMaterial | null)[]>([]);
  const tilt = useRef<Group>(null);
  const states = useRef<NodeState[]>([]);
  const t0 = useRef(-1);
  const packetsAt = useRef(Infinity);
  const froms = useMemo(() => nodes.map((_, i) => scatter(i)), [nodes]);
  const tos = useMemo(() => nodes.map((n) => new Vector3(...n.position)), [nodes]);
  const tmp = useMemo(() => new Vector3(), []);
  const index = useMemo(() => new Map(nodes.map((n, i) => [n.id, i])), [nodes]);

  // Theme: recolor in place (no remount), then ask for a frame since the loop may be idle.
  useEffect(() => {
    nodes.forEach((n, i) => {
      const accent = colors[n.accent];
      const m = matRefs.current[i];
      if (m) {
        m.color.copy(colors.surface).lerp(accent, colors.dark ? 0.16 : 0.22);
        m.emissive.copy(accent);
      }
      rigs[i]?.rim.value.copy(accent);
    });
    invalidate();
  }, [colors, nodes, rigs, invalidate]);

  // Reduced motion renders on demand, so pointer moves must ask for a frame to update hover labels.
  useEffect(() => {
    if (!reduced) return;
    const onMove = () => invalidate();
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, invalidate]);

  const dist = Math.max(8.9, 13.3 / (size.width / Math.max(size.height, 1)));

  useFrame((state, dt) => {
    const T = state.clock.elapsedTime;
    if (t0.current < 0) {
      t0.current = T;
      packetsAt.current = reduced ? Infinity : T + PACKETS_AFTER;
      markReady("hero");
      startIntro();
    }
    const it = reduced ? 99 : T - t0.current;
    const step = (obj: object, prop: string, target: number, smooth: number) => {
      if (reduced) (obj as Record<string, number>)[prop] = target;
      else easing.damp(obj, prop, target, smooth, dt);
    };

    // Tilt toward the pointer (clamped, damped).
    if (tilt.current && !reduced) {
      const c = cursor.current;
      const tx = c ? MathUtils.clamp((c.x / window.innerWidth) * 2 - 1, -1, 1) : 0;
      const ty = c ? MathUtils.clamp(-((c.y / window.innerHeight) * 2 - 1), -1, 1) : 0;
      easing.damp(tilt.current.rotation, "y", tx * MAX_TILT, 0.3, dt);
      easing.damp(tilt.current.rotation, "x", -ty * MAX_TILT, 0.3, dt);
    }

    const hl = sceneStore.get().highlight;
    const link = hl ? spanHighlight[hl] : undefined;

    // Nearest node to the cursor in view space. R3F's pointer events don't reach a shared View,
    // so hover is derived from the cursor tracked above.
    let nearest = -1;
    let hover = -1;
    const rect = slot.getBoundingClientRect();
    const c = cursor.current;
    const px = c ? ((c.x - rect.left) / rect.width) * 2 - 1 : 2;
    const py = c ? -(((c.y - rect.top) / rect.height) * 2 - 1) : 2;
    const inside = Math.abs(px) <= 1 && Math.abs(py) <= 1;
    if (inside) {
      let best = 0.5;
      groupRefs.current.forEach((g, i) => {
        if (!g) return;
        tmp.setFromMatrixPosition(g.matrixWorld).project(state.camera);
        const d = Math.hypot((tmp.x - px) * (rect.width / rect.height), tmp.y - py);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      if (best < 0.22) hover = nearest;
      if (reduced) nearest = -1;
    }
    const hoverId = hover >= 0 ? (nodes[hover]?.id ?? null) : null;
    // Hover label is plain DOM in the slot; keep it pinned above the node as the scene tilts.
    const hg = hover >= 0 ? groupRefs.current[hover] : null;
    const hn = hover >= 0 ? nodes[hover] : undefined;
    if (hg && hn) {
      tmp.setFromMatrixPosition(hg.matrixWorld);
      tmp.y += 0.95;
      const at = toSlot(tmp, state.camera);
      if (hoverRef.current !== hoverId || Math.abs(at.x - labelAt.current.x) + Math.abs(at.y - labelAt.current.y) > 0.004) {
        labelAt.current = at;
        setLabels("hero", [{ id: hn.id, text: hn.label, sub: hn.blurb, x: at.x, y: at.y, variant: "pill" }]);
      }
    } else if (hoverRef.current !== null) {
      setLabels("hero", []);
    }
    hoverRef.current = hoverId;

    nodes.forEach((n, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const st = (states.current[i] ??= { lit: 0, near: 0, hover: 0 });
      const p = reduced ? 1 : ease(MathUtils.clamp((it - i * INTRO_STAGGER) / INTRO_NODE, 0, 1));
      const from = froms[i];
      const to = tos[i];
      if (from && to) g.position.lerpVectors(from, to, p);

      const linked = link?.nodes.includes(n.id) ? (link.soft ? 0.45 : 1) : 0;
      step(st, "lit", Math.max(linked, hoverRef.current === n.id ? 1 : 0, nearest === i ? 0.55 : 0), 0.18);
      step(st, "near", nearest === i || hoverRef.current === n.id ? 1 : 0, 0.2);
      g.scale.setScalar((0.3 + 0.7 * p) * (1 + 0.08 * st.near));

      const m = matRefs.current[i];
      if (m) m.emissiveIntensity = (colors.dark ? 0.18 : 0.08) + st.lit * (colors.dark ? 0.7 : 0.35);
      const rig = rigs[i];
      if (rig) rig.k.value = (colors.dark ? 0.9 : 0.5) + st.lit * 1.3;
    });

    // Tubes fade in after the nodes land and brighten when both ends are lit.
    edges.forEach(([a, b], k) => {
      const mat = tubeRefs.current[k];
      if (!mat) return;
      const la = states.current[index.get(a) ?? -1]?.lit ?? 0;
      const lb = states.current[index.get(b) ?? -1]?.lit ?? 0;
      const appear = reduced ? 1 : MathUtils.clamp((it - 0.9) / 0.6, 0, 1);
      mat.opacity = appear * (0.3 + 0.5 * Math.min(la, lb));
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, dist]} />
      <fog attach="fog" args={[colors.bg, dist - 1.5, dist + 6]} />
      <SharedLights colors={colors} />
      <group ref={tilt}>
        {edges.map(([a, b], k) => {
          const curve = curves.get(a < b ? `${a}|${b}` : `${b}|${a}`);
          const accent = nodes.find((n) => n.id === a)?.accent === "coral" || nodes.find((n) => n.id === b)?.accent === "coral" ? "coral" : "teal";
          if (!curve) return null;
          return (
            <mesh key={`${a}-${b}`}>
              <tubeGeometry args={[curve, 28, 0.014, 6, false]} />
              <meshBasicMaterial
                ref={(m: MeshBasicMaterial | null) => {
                  tubeRefs.current[k] = m;
                }}
                color={colors[accent]}
                transparent
                opacity={0}
                toneMapped={false}
              />
            </mesh>
          );
        })}

        {nodes.map((n, i) => (
          <group
            key={n.id}
            ref={(g: Group | null) => {
              groupRefs.current[i] = g;
            }}
          >
            <Body kind={n.kind}>
              <meshStandardMaterial
                ref={(m: MeshStandardMaterial | null) => {
                  matRefs.current[i] = m;
                }}
                roughness={0.85}
                metalness={0.05}
                flatShading
                emissiveIntensity={0.2}
                onBeforeCompile={rimShader(rigs[i]?.rim ?? { value: new Color() }, rigs[i]?.k ?? { value: 1 })}
                customProgramCacheKey={() => "arch-rim"}
              />
            </Body>
            {n.id === "llm" && (
              <mesh scale={1.55}>
                <icosahedronGeometry args={[0.6, 1]} />
                <meshBasicMaterial wireframe transparent opacity={0.3} color={colors.coral} toneMapped={false} />
              </mesh>
            )}
          </group>
        ))}

        {!reduced && routes.length > 0 && (
          <Packets routes={routes} color={rerouted ? colors.coral : colors.ink} startAt={packetsAt} count={mobile ? 10 : 18} />
        )}
      </group>
    </>
  );
}
