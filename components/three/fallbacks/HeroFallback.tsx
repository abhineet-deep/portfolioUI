import { archEdges, archNodes } from "@/lib/architecture";
import { accentText } from "@/lib/accent";

// Static 2D version of the hero graph: same data, projected onto x/y.
const X = (x: number) => 200 + x * 42;
const Y = (y: number) => 150 - y * 42;

export function HeroFallback() {
  const byId = new Map(archNodes.map((n) => [n.id, n]));
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="none" stroke="rgb(var(--line))" strokeWidth="1.5">
        {archEdges.map(([a, b]) => {
          const pa = byId.get(a);
          const pb = byId.get(b);
          if (!pa || !pb) return null;
          const [ax, ay] = [X(pa.position[0]), Y(pa.position[1])];
          const [bx, by] = [X(pb.position[0]), Y(pb.position[1])];
          return <path key={`${a}-${b}`} d={`M${ax} ${ay} Q${(ax + bx) / 2} ${(ay + by) / 2 - 18} ${bx} ${by}`} />;
        })}
      </g>
      {archNodes.map((n) => (
        <circle
          key={n.id}
          cx={X(n.position[0])}
          cy={Y(n.position[1])}
          r={n.kind === "smallbox" ? 11 : 15}
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="1.5"
          className={accentText[n.accent]}
        />
      ))}
    </svg>
  );
}
