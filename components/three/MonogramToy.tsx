"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { ExtrudeGeometry, MathUtils, Object3D, Path, Shape, type Group, type InstancedMesh } from "three";
import { markReady, setEngaged } from "@/lib/sceneStore";
import { RimMaterial } from "./RimMaterial";
import { SharedLights } from "./SharedLights";
import { useThemeColors } from "./useThemeColors";

type Props = { slot: HTMLElement; reduced: boolean };

// "ad" is built from one ring plus a stem, so no font file is needed.
const R_OUT = 0.5;
const R_IN = 0.25;
const DEPTH = 0.36;
const THICK = R_OUT - R_IN;
const A_X = -0.55;
const D_X = 0.6;
const A_STEM = { h: 1.0, y: 0 };
const D_STEM = { h: 1.9, y: 0.45 };
const SHIFT_Y = -0.45;

const PARTICLES = 110;
const EXPLODE = { out: 0.35, hold: 1.5, back: 1.1 }; // seconds

function ringGeometry(): ExtrudeGeometry {
  const shape = new Shape().absarc(0, 0, R_OUT, 0, Math.PI * 2, false);
  shape.holes.push(new Path().absarc(0, 0, R_IN, 0, Math.PI * 2, true));
  const g = new ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 36 });
  g.translate(0, 0, -DEPTH / 2);
  return g;
}

// Small deterministic PRNG so the particle layout is stable.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Particle = { rest: [number, number, number]; dir: [number, number, number]; dist: number };

function makeParticles(): Particle[] {
  const r = rng(7);
  const out: Particle[] = [];
  for (let i = 0; i < PARTICLES; i++) {
    const part = Math.floor(r() * 4);
    let x: number;
    let y: number;
    if (part % 2 === 0) {
      const ang = r() * Math.PI * 2;
      const rho = Math.sqrt(r() * (R_OUT * R_OUT - R_IN * R_IN) + R_IN * R_IN);
      x = (part === 0 ? A_X : D_X) + Math.cos(ang) * rho;
      y = Math.sin(ang) * rho;
    } else {
      const stem = part === 1 ? A_STEM : D_STEM;
      x = (part === 1 ? A_X : D_X) + R_OUT - THICK / 2 + (r() - 0.5) * THICK;
      y = stem.y + (r() - 0.5) * stem.h;
    }
    const z = (r() - 0.5) * DEPTH;
    const d: [number, number, number] = [r() - 0.5, r() - 0.3, r() - 0.2];
    const len = Math.hypot(...d) || 1;
    out.push({ rest: [x, y + SHIFT_Y, z], dir: [d[0] / len, d[1] / len, d[2] / len], dist: 1.6 + r() * 2.2 });
  }
  return out;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function MonogramToy({ slot, reduced }: Props) {
  const colors = useThemeColors();
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);

  const spin = useRef<Group>(null);
  const letters = useRef<Group>(null);
  const cloud = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const particles = useMemo(makeParticles, []);
  const geo = useMemo(ringGeometry, []);
  useEffect(() => () => geo.dispose(), [geo]);

  // Interaction state lives in refs: it changes every frame and must not re-render.
  const st = useRef({ ang: 0, vel: 0, tilt: 0, tiltVel: 0, dragging: false, lastX: 0, lastY: 0, explodeAt: -1, started: false });

  useEffect(() => {
    if (reduced) return;
    const s = st.current;
    const down = (e: PointerEvent) => {
      e.preventDefault(); // no text selection while dragging or double-clicking
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.vel = 0;
      slot.setPointerCapture(e.pointerId);
      setEngaged("monogram", true);
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.ang += dx * 0.012;
      s.vel = dx * 0.012 * 60; // radians per second, handed to inertia on release
      s.tilt = MathUtils.clamp(s.tilt + dy * 0.008, -0.6, 0.6);
    };
    const up = (e: PointerEvent) => {
      s.dragging = false;
      if (slot.hasPointerCapture(e.pointerId)) slot.releasePointerCapture(e.pointerId);
    };
    const dbl = () => {
      s.explodeAt = -2; // resolved to the scene clock on the next frame
      setEngaged("monogram", true);
      invalidate();
    };
    slot.addEventListener("pointerdown", down);
    slot.addEventListener("pointermove", move);
    slot.addEventListener("pointerup", up);
    slot.addEventListener("pointercancel", up);
    slot.addEventListener("dblclick", dbl);
    slot.style.cursor = "grab";
    return () => {
      slot.removeEventListener("pointerdown", down);
      slot.removeEventListener("pointermove", move);
      slot.removeEventListener("pointerup", up);
      slot.removeEventListener("pointercancel", up);
      slot.removeEventListener("dblclick", dbl);
      slot.style.cursor = "";
    };
  }, [slot, reduced, invalidate]);

  useEffect(() => {
    invalidate();
  }, [colors, invalidate]);

  useFrame((state, dt) => {
    const s = st.current;
    if (!s.started) {
      s.started = true;
      markReady("monogram");
    }
    if (reduced) return;
    const T = state.clock.elapsedTime;
    if (s.explodeAt === -2) s.explodeAt = T;

    // Inertia + spring back to the nearest resting angle.
    if (!s.dragging) {
      s.ang += s.vel * dt;
      s.vel *= Math.exp(-3 * dt);
      const rest = Math.round(s.ang / (Math.PI * 2)) * Math.PI * 2;
      s.ang += (rest - s.ang) * (1 - Math.exp(-2.2 * dt));
      s.tilt += (0 - s.tilt) * (1 - Math.exp(-3 * dt));
    }
    if (spin.current) {
      spin.current.rotation.y = s.ang;
      spin.current.rotation.x = s.tilt;
    }

    // Explosion: letters scatter into packets, hold, then reassemble.
    let exploding = false;
    let letterScale = 1;
    const mesh = cloud.current;
    if (mesh) {
      const t = s.explodeAt >= 0 ? T - s.explodeAt : -1;
      const total = EXPLODE.out + EXPLODE.hold + EXPLODE.back;
      if (t >= 0 && t < total + 0.25) {
        exploding = true;
        const out = easeOut(MathUtils.clamp(t / EXPLODE.out, 0, 1));
        const back = easeInOut(MathUtils.clamp((t - EXPLODE.out - EXPLODE.hold) / EXPLODE.back, 0, 1));
        const spread = out * (1 - back);
        letterScale = t < 0.12 ? 1 - t / 0.12 : t > total ? MathUtils.clamp((t - total) / 0.25, 0, 1) : 0;
        for (let i = 0; i < PARTICLES; i++) {
          const p = particles[i];
          if (!p) continue;
          const drift = Math.sin(T * 1.2 + i) * 0.05 * spread;
          dummy.position.set(
            p.rest[0] + p.dir[0] * p.dist * spread + drift,
            p.rest[1] + p.dir[1] * p.dist * spread,
            p.rest[2] + p.dir[2] * p.dist * spread,
          );
          dummy.scale.setScalar(t > total ? Math.max(0, 1 - (t - total) / 0.1) : 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.visible = true;
        mesh.instanceMatrix.needsUpdate = true;
      } else {
        if (t >= total + 0.25) s.explodeAt = -1;
        mesh.visible = false;
      }
    }
    letters.current?.scale.setScalar(Math.max(0.0001, letterScale));

    const settled = !s.dragging && !exploding && Math.abs(s.vel) < 0.02 && Math.abs(s.ang - Math.round(s.ang / (Math.PI * 2)) * Math.PI * 2) < 0.003 && Math.abs(s.tilt) < 0.003;
    if (settled) setEngaged("monogram", false);
  });

  const dist = Math.max(7, 6.4 / (size.width / Math.max(size.height, 1)));
  const base = useMemo(() => colors.surface.clone().lerp(colors.teal, 0.3), [colors.surface, colors.teal]);
  const strength = colors.dark ? 1.2 : 0.6;

  const mat = <RimMaterial rimColor={colors.teal} base={base} strength={strength} emissive={colors.dark ? 0.3 : 0.12} />;

  return (
    <>
      <PerspectiveCamera makeDefault fov={35} position={[0, 0, dist]} />
      <SharedLights colors={colors} />
      <group ref={spin}>
        <group ref={letters} position={[0, SHIFT_Y, 0]}>
          <mesh position={[A_X, 0, 0]}>
            <primitive object={geo} attach="geometry" />
            {mat}
          </mesh>
          <mesh position={[D_X, 0, 0]}>
            <primitive object={geo} attach="geometry" />
            {mat}
          </mesh>
          <RoundedBox args={[THICK, A_STEM.h, DEPTH]} radius={0.04} smoothness={2} position={[A_X + R_OUT - THICK / 2, A_STEM.y, 0]}>
            {mat}
          </RoundedBox>
          <RoundedBox args={[THICK, D_STEM.h, DEPTH]} radius={0.04} smoothness={2} position={[D_X + R_OUT - THICK / 2, D_STEM.y, 0]}>
            {mat}
          </RoundedBox>
        </group>
        <instancedMesh ref={cloud} args={[undefined, undefined, PARTICLES]} visible={false} frustumCulled={false}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={colors.teal} toneMapped={false} />
        </instancedMesh>
      </group>
    </>
  );
}
