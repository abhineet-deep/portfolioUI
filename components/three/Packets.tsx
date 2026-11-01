"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { Object3D, Vector3, type Color, type Curve, type InstancedMesh } from "three";

type Props = {
  routes: Curve<Vector3>[][];
  color: Color;
  /** Packets start flowing once the scene clock passes this value. */
  startAt: { current: number };
  /** Steady packets, plus a short train every BURST_EVERY seconds. */
  count?: number;
  burstSize?: number;
  /** Fraction of a route covered per second. */
  speed?: number;
};

const BURST_EVERY = 7;
const BURST_LEN = 1.6;

/** Tiny spheres travelling along curve routes, as one InstancedMesh. */
export function Packets({ routes, color, startAt, count = 18, burstSize = 8, speed = 0.1 }: Props) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const tmp = useMemo(() => new Vector3(), []);
  const phases = useMemo(() => Array.from({ length: count }, (_, i) => (i * 0.6180339) % 1), [count]);
  const fade = useRef({ v: 0 });
  const lastRoutes = useRef(routes);
  const total = count + burstSize;

  // Hide everything before the first frame so no instance sits at the origin.
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    for (let i = 0; i < total; i++) m.setMatrixAt(i, dummy.matrix);
    m.instanceMatrix.needsUpdate = true;
  }, [dummy, total]);

  useFrame((state, dt) => {
    const mesh = ref.current;
    if (!mesh || routes.length === 0) return;
    const T = state.clock.elapsedTime;
    const on = T >= startAt.current;

    // Rerouting swaps routes: dip to zero and ease back in instead of popping.
    if (lastRoutes.current !== routes) {
      lastRoutes.current = routes;
      fade.current.v = 0;
    }
    easing.damp(fade.current, "v", on ? 1 : 0, 0.35, dt);
    const f = fade.current.v;

    const place = (i: number, route: Curve<Vector3>[], u: number, size: number) => {
      const n = route.length;
      const seg = Math.min(n - 1, Math.floor(u * n));
      const local = u * n - seg;
      route[seg]?.getPoint(local, tmp);
      // Shrink to nothing at each node so packets seem to enter and leave it.
      const edge = Math.min(1, local * 5, (1 - local) * 5);
      dummy.position.copy(tmp);
      dummy.scale.setScalar(size * f * Math.max(0.0001, edge));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    };

    for (let i = 0; i < count; i++) {
      const route = routes[i % routes.length];
      if (!route) continue;
      place(i, route, (T * speed + (phases[i] ?? 0)) % 1, 1);
    }

    const burstT = (T % BURST_EVERY) / BURST_LEN;
    const burstRoute = routes[Math.floor(T / BURST_EVERY) % routes.length];
    for (let k = 0; k < burstSize; k++) {
      const u = burstT - k * 0.07;
      if (!burstRoute || u <= 0 || u >= 1) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(count + k, dummy.matrix);
      } else {
        place(count + k, burstRoute, u, 0.85);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, total]} frustumCulled={false}>
      <sphereGeometry args={[0.05, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
}
