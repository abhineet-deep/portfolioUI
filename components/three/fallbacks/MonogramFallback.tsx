// Flat version of the 3D "ad" monogram: two rings with stems, same proportions.
export function MonogramFallback() {
  const ring = { r: 30, w: 20 };
  const cy = 140;
  const parts = [
    { cx: 74, stemH: 80, stemTop: cy - 40 },
    { cx: 166, stemH: 152, stemTop: cy - 112 },
  ];
  return (
    <svg viewBox="0 0 240 200" className="h-full w-full text-teal" fill="none" aria-hidden="true">
      {parts.map((p) => (
        <g key={p.cx}>
          <circle cx={p.cx} cy={cy} r={ring.r} stroke="currentColor" strokeOpacity="0.55" strokeWidth={ring.w} />
          <rect x={p.cx + 20} y={p.stemTop} width={ring.w} height={p.stemH} rx="3" fill="currentColor" fillOpacity="0.55" />
        </g>
      ))}
    </svg>
  );
}
