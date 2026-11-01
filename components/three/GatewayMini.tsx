"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { CatmullRomCurve3, Vector3, type Curve, type Group } from "three";
import { gatewayDiagram } from "@/lib/content";
import { markReady, setLabels, useSceneStore } from "@/lib/sceneStore";
import { Packets } from "./Packets";
import { toSlot } from "./project";
import { RimMaterial } from "./RimMaterial";
import { SharedLights } from "./SharedLights";
import { useThemeColors } from "./useThemeColors";

type Props = { reduced: boolean };

const FOV = 35;
const MODEL_Y = [1.35, 0, -1.35] as const;
const PHASE = 4; // seconds per healthy / failing phase

export function GatewayMini({ reduced }: Props) {
  const colors = useThemeColors();
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  const engaged = useSceneStore((s) => !!s.engaged.gateway) && !reduced;
  const [failed, setFailed] = useState(-1);
  const ring = useRef<Group>(null);
  const packetsAt = useRef(0);
  const started = useRef(false);

  const { inCurve, outCurves } = useMemo(() => {
    const a = new Vector3(-2.3, 0, 0);
    const g = new Vector3(-0.75, 0, 0);
    return {
      inCurve: new CatmullRomCurve3([a, a.clone().lerp(g, 0.5), g]),
      outCurves: MODEL_Y.map((y) => new CatmullRomCurve3([new Vector3(0.75, 0, 0), new Vector3(1.8, y * 0.45, 0.15), new Vector3(2.55, y, 0)])),
    };
  }, []);

  const routes = useMemo(() => {
    const r: Curve<Vector3>[][] = [];
    outCurves.forEach((c, i) => {
      if (i !== failed) r.push([inCurve, c]);
    });
    return r;
  }, [inCurve, outCurves, failed]);

  const teal = colors.teal;
  const coral = colors.coral;
  const healthyBase = useMemo(() => colors.surface.clone().lerp(teal, 0.2), [colors.surface, teal]);
  const failedBase = useMemo(() => colors.surface.clone().lerp(coral, 0.45), [colors.surface, coral]);
  const appBase = useMemo(() => colors.surface.clone().lerp(colors.iris, 0.2), [colors.surface, colors.iris]);
  const coreBase = useMemo(() => colors.surface.clone().lerp(coral, 0.25), [colors.surface, coral]);
  const strength = colors.dark ? 1.1 : 0.6;

  useEffect(() => {
    invalidate();
  }, [colors, invalidate]);

  // Labels are DOM in the slot; project their anchors whenever the view or failover state changes.
  const labelKey = `${size.width}x${size.height}:${failed}`;
  const labelsFor = useRef("");
  const anchors = useMemo(
    () => [
      { id: "app", text: gatewayDiagram.source, at: new Vector3(-2.9, -0.95, 0) },
      { id: "gw", text: gatewayDiagram.hub, at: new Vector3(0, -1.25, 0) },
      ...gatewayDiagram.targets.map((t, i) => ({ id: `m${i}`, text: t, at: new Vector3(3, (MODEL_Y[i] ?? 0) - 0.68, 0) })),
    ],
    [],
  );

  useFrame((state, dt) => {
    if (labelsFor.current !== labelKey) {
      labelsFor.current = labelKey;
      setLabels(
        "gateway",
        anchors.map((a, i) => {
          const p = toSlot(a.at, state.camera);
          const failedHere = i >= 2 && failed === i - 2;
          return { id: a.id, text: a.text, x: p.x, y: p.y, variant: "tag" as const, tone: failedHere ? ("coral" as const) : ("muted" as const) };
        }),
      );
    }
    if (!started.current) {
      started.current = true;
      markReady("gateway");
    }
    if (!engaged) return;
    const T = state.clock.elapsedTime;
    // Alternate a healthy phase with a failing one; the failing model rotates.
    const phase = Math.floor(T / PHASE);
    const next = phase % 2 === 1 ? Math.floor(phase / 2) % 3 : -1;
    setFailed((f) => (f === next ? f : next));
    if (ring.current) ring.current.rotation.z += dt * 0.7;
  });

  // Packets restart from "now" each time the card is engaged.
  useEffect(() => {
    packetsAt.current = engaged ? 0 : Infinity;
    invalidate();
  }, [engaged, invalidate]);

  const dist = Math.max(6.2, 11.5 / (size.width / Math.max(size.height, 1)));
  const tubeColor = colors.line;

  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, dist]} />
      <SharedLights colors={colors} />

      {[inCurve, ...outCurves].map((c, i) => (
        <mesh key={i}>
          <tubeGeometry args={[c, 24, 0.014, 6, false]} />
          <meshBasicMaterial color={tubeColor} transparent opacity={0.9} toneMapped={false} />
        </mesh>
      ))}

      <group position={[-2.9, 0, 0]}>
        <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.12} smoothness={3}>
          <RimMaterial rimColor={colors.iris} base={appBase} strength={strength} emissive={0.12} />
        </RoundedBox>
      </group>

      <group position={[0, 0, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.55, 1]} />
          <RimMaterial rimColor={coral} base={coreBase} strength={strength + 0.3} emissive={colors.dark ? 0.45 : 0.2} />
        </mesh>
        <group ref={ring} rotation={[1.1, 0.3, 0]}>
          <mesh>
            <torusGeometry args={[0.95, 0.035, 8, 56]} />
            <meshBasicMaterial color={coral} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {gatewayDiagram.targets.map((t, i) => {
        const isFailed = failed === i;
        return (
          <group key={t} position={[3, MODEL_Y[i] ?? 0, 0]} scale={isFailed ? 0.85 : 1}>
            <mesh>
              <icosahedronGeometry args={[0.42, 2]} />
              <RimMaterial
                rimColor={isFailed ? coral : teal}
                base={isFailed ? failedBase : healthyBase}
                strength={isFailed ? 0.5 : strength}
                emissive={isFailed ? 0.05 : 0.2}
              />
            </mesh>
          </group>
        );
      })}

      {engaged && routes.length > 0 && (
        <Packets routes={routes} color={colors.ink} startAt={packetsAt} count={9} burstSize={0} speed={0.16} />
      )}
    </>
  );
}
