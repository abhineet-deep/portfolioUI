import type { Color } from "three";

/** Adds a soft fresnel rim to a standard material's emissive term. */
export function rimShader(rim: { value: Color }, k: { value: number }) {
  return (shader: { uniforms: Record<string, unknown>; fragmentShader: string }) => {
    shader.uniforms.uRim = rim;
    shader.uniforms.uRimK = k;
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform vec3 uRim;\nuniform float uRimK;\nvoid main() {")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float fr = pow(1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))), 2.2);
        totalEmissiveRadiance += uRim * fr * uRimK;`,
      );
  };
}
