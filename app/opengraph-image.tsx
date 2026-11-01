import { ImageResponse } from "next/og";
import { hero, site, type Accent } from "@/lib/content";
import { monthIndex } from "@/lib/accent";
import { drawnSpans } from "@/lib/visible";

export const alt = `${site.name}: ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dark-theme tokens from app/globals.css. CSS variables aren't available when rendering an image.
const C = { bg: "#0F1522", surface: "#161E2E", line: "#26314A", ink: "#E8EDF6", muted: "#8995AD" };
const ACCENT: Record<Accent, string> = { teal: "#3DD6C6", iris: "#93A0FF", amber: "#F2B33D", coral: "#FF7E9D" };

export default function OpengraphImage() {
  const d = new Date();
  const now = { year: d.getFullYear(), month: d.getMonth() + 1 };
  const axisStart = monthIndex(hero.axisStart);
  const total = monthIndex(now) + 1 - axisStart;
  const spans = drawnSpans();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: C.bg,
          color: C.ink,
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, color: C.muted }}>{site.role}</div>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 700, letterSpacing: -3, marginTop: 8 }}>{site.name}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: C.surface,
            border: `2px solid ${C.line}`,
            borderRadius: 28,
            padding: "28px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: C.muted, marginBottom: 18 }}>
            <div style={{ display: "flex", background: "#173a40", color: ACCENT.teal, borderRadius: 999, padding: "2px 14px", marginRight: 16 }}>
              {hero.traceMethod}
            </div>
            <div style={{ display: "flex", color: C.ink, marginRight: 16 }}>{hero.tracePath}</div>
            <div style={{ display: "flex", color: ACCENT.teal }}>{hero.traceStatus}</div>
          </div>
          {spans.map((s) => {
            const start = Math.max(monthIndex(s.start), axisStart);
            const end = monthIndex(s.end === "now" ? now : s.end) + 1;
            const left = ((start - axisStart) / total) * 100;
            const width = Math.max(((end - start) / total) * 100, 1.2);
            return (
              <div key={s.id} style={{ display: "flex", position: "relative", height: 26, marginTop: 8 }}>
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    top: 4,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: 18,
                    borderRadius: 999,
                    background: ACCENT[s.accent],
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    ),
    size,
  );
}
