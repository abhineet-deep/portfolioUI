import { useMemo } from "react";
import { Color } from "three";
import { rimShader } from "./rim";

/** Matte standard material with a fresnel rim; colors are mutated in place so theme changes don't remount. */
export function RimMaterial({ rimColor, base, strength, emissive }: { rimColor: Color; base: Color; strength: number; emissive: number }) {
  const rim = useMemo(() => ({ value: new Color() }), []);
  const k = useMemo(() => ({ value: 1 }), []);
  const onBeforeCompile = useMemo(() => rimShader(rim, k), [rim, k]);
  rim.value.copy(rimColor);
  k.value = strength;
  return (
    <meshStandardMaterial
      color={base}
      emissive={rimColor}
      emissiveIntensity={emissive}
      roughness={0.85}
      metalness={0.05}
      flatShading
      onBeforeCompile={onBeforeCompile}
      customProgramCacheKey={() => "arch-rim"}
    />
  );
}
