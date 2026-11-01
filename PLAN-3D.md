# 3D plan

Status: **plan only, nothing installed or coded yet.** Three decisions are needed from you at the bottom.

## What exists today

- React 19.3.1, Next 16.4.3 (App Router, Turbopack), Tailwind 3.4.19, Framer Motion 14.9.0.
- Colors are CSS variables holding RGB channels (`--teal`, `--coral`, `--amber`, `--iris`, `--bg`, `--line`, ...), switched by next-themes via a `.dark` / `.light` class on `<html>`.
- Hero is server-rendered text (headline, summary, buttons) followed by `TraceHero` (client). The trace bars grow from width 0 with a 110ms stagger, which is the one orchestrated load animation.
- `TraceHero` already owns "which span is active" as local state. Span ids: `root, btech, certs, tcs, virtusa, flowsmith, llm-gateway, statement-analyzer`.
- Projects: the LLM gateway card is `SpotlightCard` + an SVG `GatewayDiagram` with CSS-`offset-path` packets, driven by `.group:hover`.
- Contact section has the MagneticButton and links; footer sits below it.

## Packages (exact pins, all published before 2026-10-18)

| package | version | published | why |
|---|---|---|---|
| three | 0.186.1 | 2026-09-24 | engine (0.187.0 is only 2 days old, so skipped) |
| @types/three | 0.186.0 | 2026-09-11 | types for strict TS; must match `three` |
| @react-three/fiber | 9.8.2 | 2026-10-14 | React 19 renderer (v9 is the React 19 line; peer range is `react >=19 <19.4`, fine for 19.3.1) |
| @react-three/drei | 10.7.9 | 2026-09-25 | `View`, `Html`, `PresentationControls`, `AdaptiveDpr`, `PerformanceMonitor`, `Text3D`/`Center` |
| maath | 0.10.8 | 2024-07-07 | `easing.damp` for tilt/scale |

- **Not added:** `@react-three/postprocessing` / `postprocessing` (see decision 2). No Zustand: the span-to-node link uses a ~20-line external store read with `useSyncExternalStore`, so there is no new dependency and no React-context bridging problem across the R3F reconciler.
- `@types/three` is a dev dependency and isn't in your list. It is required by strict TypeScript; flagging it rather than assuming.
- I'll report the real gzip size added to the first-load and lazy chunks after Scene 1.

## Architecture: one shared canvas

`SceneRoot` is mounted once in `app/layout.tsx` (client, behind `next/dynamic` with `ssr: false`). It renders a single fixed, full-viewport `<Canvas>` with `eventSource={document.body}`, `frameloop="demand"`, `dpr={[1, 1.75]}`, `<AdaptiveDpr>` and `<PerformanceMonitor>`. The canvas wrapper is `aria-hidden`, `pointer-events-none`, behind page content.

Each scene is a drei `<View>` tracking a placeholder `<div>` in the page:

- Hero: `<div>` positioned in the hero section, right side on desktop, faded behind the text on mobile.
- Gateway card: `<div>` inside the existing card where the SVG diagram is now.
- Monogram: `<div>` in the contact panel.

Why this works: one WebGL context, and scenes cost nothing when their div is off-screen.

Known risk: `View` and postprocessing don't compose well, because `View` takes over rendering with a scissor per view. That is the reason for decision 2. If `View` misbehaves with Lenis-driven scrolling or pointer events, I'll tell you before falling back to separate canvases.

**Loading:** the dynamic import is kicked off from a `requestIdleCallback` after hydration, so the hero text and the SVG fallbacks paint first. The canvas can never be the LCP element because it fades in after the text. The Gateway SVG and a simple static SVG of the hero graph stay in place as fallbacks until the 3D scene reports ready, and permanently where 3D is disabled.

## Scene 1: hero "living architecture"

- `lib/architecture.ts` holds all data: nodes (id, label, one-line factual blurb, geometry kind, position, accent role), edges, and the span-to-node highlight map. Nothing hardcoded in components.
- Nodes (desktop, 7): API Gateway (rounded box, teal), Lambda (icosahedron, teal), DynamoDB (cylinder, teal), SQS (torus, amber), Kafka (octahedron, amber), Redis (small rounded box, teal), LLM (icosahedron, wireframe shell, coral). Mobile: 4 nodes (API Gateway, Lambda, DynamoDB, LLM) and fewer edges.
- Edges: `CatmullRomCurve3` rendered as thin `TubeGeometry` with emissive material.
- Packets: `Packets.tsx` is one `InstancedMesh` per scene; positions are computed per frame from curve `getPoint(t)`. Slow speed, occasional bursts (a short train of 4 to 6 packets), capped instance count.
- Cursor: group rotation damped toward the pointer (max 8°) with `maath/easing.damp`. Nearest node to the pointer gets scale +8% and a brighter emissive.
- Hover label: drei `<Html>` with name and generic blurb, for example "DynamoDB: single-digit millisecond reads". No metrics about you.
- Glow without bloom: emissive rim via a fresnel term in `onBeforeCompile` on a `MeshStandardMaterial`, plus tube emissive. In dark mode it reads as glow; in light mode the same colors are read from the light tokens, which are already darker.
- Depth fade: scene fog tinted with `--bg`, plus a CSS gradient mask on the placeholder div so text stays readable. I'll check contrast in both themes.
- Intro: nodes lerp from scattered positions to the graph over ~1.2s, then packets start.
- **Span link:** `TraceHero` calls `setHighlight(spanId | null)` on the shared store alongside its existing active state. Mapping in `architecture.ts`:
  - `root`: all nodes softly lit
  - `tcs`, `virtusa`: API Gateway + Lambda (+ DynamoDB)
  - `llm-gateway`: LLM node, and packets reroute API Gateway -> LLM -> Lambda for as long as it's active
  - `statement-analyzer`: LLM + DynamoDB
  - `flowsmith`: LLM + SQS
  - `certs`: the AWS-flavored nodes (API Gateway, Lambda, DynamoDB, SQS)
  - `btech`: none

## Scene 2: gateway mini router

Replaces the SVG inside the LLM gateway card only visually; the SVG stays as the fallback and for reduced motion. App cube -> gateway core with rotating ring -> three model spheres. Every few seconds a failover: one sphere dims toward `--coral`, packets reroute to another. Animates only on card hover or focus (the card already has `tabIndex=0`, so tap-to-focus works on touch); otherwise one still frame. Since a View needs the shared canvas to render, I'll call `invalidate()` only while active.

## Scene 3: monogram easter egg

"ad" as extruded geometry, drag to spin with inertia and snap back (`PresentationControls`), double-click explodes into packets that reassemble. Desktop only; disabled under the mobile rule. Font: I'll check whether `three/examples/fonts/*.typeface.json` ships in the pinned version; if so, use `Text3D` with a lazily loaded font. If not, or if it's heavy, I'll hand-build the two letters from `ExtrudeGeometry` shapes, which needs no font file. I'll tell you which.

## Theme

`useThemeColors()` reads `--teal --coral --amber --iris --bg --line --ink` from `getComputedStyle(document.documentElement)`, splits the RGB channels into `THREE.Color`s, and re-reads when next-themes changes the `class` on `<html>` (MutationObserver). Materials get colors via refs/uniforms updated on change, not remounted.

## Performance and accessibility rules, and how each is met

- Lazy + `ssr: false` + static fallback: described above.
- Single context: `View` architecture.
- Off-screen pause: `frameloop="demand"`; an `IntersectionObserver` per placeholder decides whether a view is active; a global driver calls `invalidate()` per frame only while some active view animates; `document.visibilitychange` stops it entirely.
- DPR: `[1, 1.75]` with `AdaptiveDpr` + `PerformanceMonitor` lowering it.
- Dispose geometries/materials on unmount; no textures at all, so none over 512px.
- Mobile (<768px or coarse pointer): 4-node hero, no tilt, no gyroscope, Scene 3 not mounted.
- Reduced motion: no packets, no intro, no tilt; one composed static frame (render once, `invalidate()` only for hover labels).
- Decorative: wrapper `aria-hidden`; nothing focusable inside the canvas; labels are mouse-only extras. The same information stays in hero copy and project text.
- Budget: Lighthouse mobile performance >= 85. I'll run it and report; the extension prompt blocked JS earlier, so I may ask you to approve that or run Lighthouse in your own Chrome DevTools.

## Build order

1. Scene 1 (+ shared store, theme hook, `SceneRoot`, `Packets`, fallbacks), `npm run build`, local check instructions.
2. Scene 2, build.
3. Scene 3, build.
4. Final report: package sizes, how each rule is handled, anything simplified.

## Decisions needed

1. **One load animation.** Today the trace bars grow with a 110ms stagger (your original "ONE orchestrated page-load animation" rule). The new node assembly would be a second one. My recommendation: keep one orchestrated moment by running both off the same clock: bars grow while the nodes assemble (~1.2s total, bars keep the stagger), instead of deleting either. Alternative: remove the bar animation so the bars render at full width and only the 3D assembles. Which one?
2. **Skip Bloom.** I recommend no `@react-three/postprocessing`: it conflicts with the shared-canvas `View` approach, adds two packages, and the emissive rim + tube glow gets most of the effect. Say the word if you want Bloom anyway and I'll try it and report if it breaks.
3. **Approve the package list above**, including `@types/three` and the exact (older-than-latest) versions.
