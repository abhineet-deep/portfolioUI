import { CatmullRomCurve3, Vector3, type Curve } from "three";
import type { ArchNode } from "@/lib/architecture";

const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** Curves keyed by sorted node pair; stored in sorted direction (a < b). */
export function buildCurves(nodes: ArchNode[], edges: [string, string][]): Map<string, CatmullRomCurve3> {
  const pos = new Map(nodes.map((n) => [n.id, new Vector3(...n.position)]));
  const curves = new Map<string, CatmullRomCurve3>();
  edges.forEach(([x, y], i) => {
    const [a, b] = x < y ? [x, y] : [y, x];
    const pa = pos.get(a);
    const pb = pos.get(b);
    if (!pa || !pb) return;
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    const d = pb.clone().sub(pa);
    // Bulge sideways and in depth so edges read as curves, alternating per edge.
    const s = i % 2 === 0 ? 1 : -1;
    mid.add(new Vector3(-d.y, d.x, 0).normalize().multiplyScalar(0.35 * s));
    mid.z += 0.35 * s;
    curves.set(key(a, b), new CatmullRomCurve3([pa, mid, pb]));
  });
  return curves;
}

/** A curve running from -> to, reversing the stored one if needed. */
export function orient(curves: Map<string, CatmullRomCurve3>, from: string, to: string): Curve<Vector3> | null {
  const c = curves.get(key(from, to));
  if (!c) return null;
  return from < to ? c : new CatmullRomCurve3([...c.points].reverse());
}

/** Turn node-path routes into oriented curve lists, dropping routes with a missing node/edge. */
export function routeCurves(
  routes: readonly (readonly string[])[],
  curves: Map<string, CatmullRomCurve3>,
): Curve<Vector3>[][] {
  const out: Curve<Vector3>[][] = [];
  for (const r of routes) {
    const segs: Curve<Vector3>[] = [];
    for (let i = 0; i < r.length - 1; i++) {
      const c = orient(curves, r[i] ?? "", r[i + 1] ?? "");
      if (!c) break;
      segs.push(c);
    }
    if (segs.length === r.length - 1) out.push(segs);
  }
  return out;
}
