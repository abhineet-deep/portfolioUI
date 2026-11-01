# Portfolio v2 plan

Status: **plan only. Nothing changed, nothing installed.** Decisions I need from you are at the bottom.

## Starting point

Next 16.4.3 / React 19.3.1 / Tailwind 3.4.19 / Framer Motion 14.9.0, R3F 9.8.2. Content in `lib/content.ts`, scene wiring in `lib/sceneStore.ts` + `components/three/*`. The live deploy is the Vercel project built from `abhineet-deep/portfolioUI` on `main`.

## Packages

| package | version | published | status |
|---|---|---|---|
| @vercel/analytics | 2.0.1 | stable | pre-approved |
| @vercel/speed-insights | 2.0.0 | 2026-03-10 | pre-approved |
| zod | 4.6.7 | 2026-10-12 (20 days) | **needs your OK** (decision 2) |

Everything else is built in: `next/og`, `ImageResponse` for icons, Web Audio, View Transitions, Framer Motion, cmdk. Zod 4 also ships `z.toJSONSchema`, which I'd use to produce the OpenAPI component schemas from the same types, so there's no second schema library.

## Items

### 1. Fix first
| item | files | notes |
|---|---|---|
| 1.1 Hide placeholders | `lib/content.ts`, `Timeline.tsx`, `TraceHero.tsx`, `Projects.tsx`, new `lib/visible.ts`, new `scripts/check-content.mjs`, `package.json` (`prebuild`) | Placeholder fields become empty/absent with a `// TODO` comment; components skip empty fields (no "TODO", no "–"). The prebuild script fails if any string literal in `content.ts` contains "TODO" (comments are allowed). Reads source text, so it needs no TS runtime. |
| 1.2 Trace root from Jul 2022 | `TraceHero.tsx`, `content.ts`, `accent.ts` | See decision 1. Recommendation: drop B.Tech from the waterfall and show it as one muted line under the panel ("Before this trace: B.Tech, Heritage Institute of Technology, Kolkata"), using existing content. Axis starts at Jul 2022, so the header reads about 4y. Dimmed pre-window bar would need the axis to start in 2018 and kill the "four years" framing. |
| 1.3 Marquee a11y | `StackMarquee.tsx` | One real `<ul>` for assistive tech (visually the first copy, in the DOM once); every visual duplicate `aria-hidden` and not focusable. |
| 1.4 Payments chips | `Projects.tsx`, `content.ts` | Six chips, all already in the stack: Node.js, TypeScript, AWS Lambda, API Gateway, DynamoDB, SQS. |
| 1.5 Monogram + kbd | `Nav.tsx`, `KeyHint.tsx`, `SmoothScroll.tsx` | `href="#top"`. `KeyHint` renders "⌘K" on the server and swaps to "Ctrl K" after mount on non-Mac (today it renders a blank until mounted; this removes the flash of nothing). |
| 1.6 Metadata + OG | `app/layout.tsx`, new `app/opengraph-image.tsx`, `lib/site-url.ts` | `metadataBase` from `NEXT_PUBLIC_SITE_URL`, falling back to `https://portfolio-ui-five-hazel.vercel.app`. `summary_large_image`. OG image via `next/og`: name, role, mini waterfall in site colors. It uses the default bundled font (a custom font needs a network fetch at build; not worth the fragility). |

### 2. Live API terminal
- **Routes (all under `app/api/`):** `engineers/abhineet-deep`, `projects`, `projects/[slug]`, `health`, `openapi.json`, and a catch-all `[...path]` returning the JSON 404 `{ error: { code, message } }`. Shared helpers in `lib/api/` (`respond.ts` for ETag/Cache-Control/CORS/Server-Timing/JSON, `ratelimit.ts`, `schemas.ts`, `profile.ts`).
- **Behavior:** responses validated with Zod before sending; weak `ETag` from a hash of the body plus `304` on `If-None-Match`; `Cache-Control: public, max-age=60, stale-while-revalidate=300` (health is `no-store`); a real `Server-Timing` measured around handler work; `GET`/`OPTIONS` CORS; in-memory sliding-window limit (30 req/min per IP) returning `429` + `Retry-After`, with a comment that state is per serverless instance. Profile JSON omits empty fields.
- **Terminal UI:** `components/Terminal.tsx` + `lib/highlight.ts` (about 40-line tokenizer for JSON). Preset buttons, free-typed `/api/*` paths, ↑/↓ history, status line, key headers, measured round-trip ms (`performance.now`), `aria-live="polite"` output. Typed-out animation skips under reduced motion.
- **Tie-in:** a small store appends the last 3 completed requests as live spans in `TraceHero` with real latency. They need a color that isn't one of the four semantic accents (decision 4).
- Placed directly below the hero in `app/page.tsx`.

### 3. Scroll storytelling
| item | files | notes |
|---|---|---|
| 3.1 Trace as navigation | new `components/SectionTrace.tsx`, `app/page.tsx` | Appears after the hero leaves view (IntersectionObserver). Side rail at ≥1400px wide, top strip below that. One bar per section (Projects, Experience, Contact; payment flow and stack get bars too if you want them, decision 6), `useScroll` per section drives the fill, click calls `scrollToId`. There is no generic progress bar today, so nothing to remove. |
| 3.2 Heading reveals | new `components/Reveal.tsx`, headings in `Projects`/`Timeline`/`Contact` | Whole-heading clip-path mask reveal on first view, once. I recommend against per-line splitting: finding line breaks needs layout measurement after hydration and flashes or mis-wraps at different widths. Headings here are 1-2 lines, so a single mask reads as the same thing. |
| 3.3 Payment flow | new `components/PaymentFlow.tsx`, `content.ts` | Responsive SVG: client -> API Gateway -> idempotency check -> payment service -> queue -> ledger -> webhook, with retry/backoff and DLQ branches. "Send request" animates a packet; "Simulate failure" shows retry then DLQ. Steps are buttons with ≤40-word explanations, kept in `content.ts` for you to review. Reduced motion: steps highlight in sequence. Generic, no employer specifics. |

### 4. Interaction polish
| item | files | notes |
|---|---|---|
| 4.1 Circular theme reveal | `ThemeToggle.tsx`, `globals.css` | `document.startViewTransition` with `flushSync` around `setTheme`; clip-path circle grows from the button; fallback is the instant switch. |
| 4.2 Bento tilt + gradient border | `SpotlightCard.tsx`, `globals.css` | Max 4°, spring-damped; desktop `(hover: hover) and (pointer: fine)` only. The 1px border and the existing spotlight share one cursor-driven mask, so it reads as one effect, not three (see pushback). |
| 4.3 Custom cursor | new `components/Cursor.tsx` | See pushback: I'd keep the native cursor visible and add the dot/ring on top. |
| 4.4 Copy feedback | `Contact.tsx` | "Copied" for 2s with an animated check; magnetic button unchanged. |
| 4.5 Sounds | new `lib/sound.ts`, `components/SoundToggle.tsx`, `Nav.tsx`, `CommandMenu.tsx` | Tiny oscillator blips via Web Audio, created lazily on first user gesture, off by default, saved in `localStorage`. |
| 4.6 Stack upgrade | `StackMarquee.tsx`, new `StackGroups.tsx`, `content.ts` | Groups use only existing items: Runtime & languages (Node.js, TypeScript, Express, React, GraphQL, Swagger/OpenAPI); AWS (Lambda, API Gateway, DynamoDB, SQS, SNS, EventBridge, IAM, CDK, EC2); Data (MongoDB, MySQL, PostgreSQL, Redis); Messaging (Kafka, plus SQS/SNS listed under AWS only); Testing & tooling (Jest, Mocha, Docker). Filter chips; hovering a chip adds a highlight class to matching marquee items. |

### 5. Command palette
`CommandMenu.tsx`: search over sections, projects (from `projects`) and stack items; actions Run API request (opens the terminal with that command), Toggle sounds, Toggle theme, Copy email; `⌘`-style hints per item (`<kbd>`); the `sudo hire abhineet` easter egg is a synthetic item that appears for that exact query, shows a one-line toast and scrolls to Contact. The search input's value is already available from cmdk, so no extra state library is needed.

### 6. First impression
- **Boot moment:** `components/Boot.tsx` + a `sessionStorage` flag. The headline is in the server HTML as before, so LCP is untouched. A one-line terminal strip types above it, resolves, and then `startIntro()` fires, so trace bars and 3D nodes run from that one clock. First visit per session only; skipped under reduced motion. The existing 2.5 s give-up timer stays as the safety net.
- **404:** `app/not-found.tsx` styled as the terminal, using the same JSON error shape.
- **Favicons:** `app/icon.svg` stays; add `app/apple-icon.tsx` (ImageResponse), `app/manifest.ts`, and `themeColor` per scheme through `viewport` media queries plus a tiny effect that follows the manual theme toggle.

### 7. 3D and performance
- Re-verify and report: lazy load after hero text, pause off-screen and hidden tab, mobile variant, static frame under reduced motion. Chunk size was about 255 KB gzipped; I'll re-measure.
- Add `@vercel/analytics` and `@vercel/speed-insights` in `layout.tsx` (only render on Vercel).
- `app/sitemap.ts`, `app/robots.ts`, JSON-LD `Person` (name, jobTitle, url, sameAs from existing GitHub/LinkedIn).
- Lighthouse: decision 5.

## Pushback: things I think are weak ideas for this site

1. **Effect stacking on bento cards.** Spotlight + tilt + gradient border + magnetic button + custom cursor + sounds + circular theme reveal is a lot against your own "one strong moment per section" rule. Plan: merge border and spotlight into one mask and keep tilt subtle; the rest stay but each is small and opt-out (reduced motion, coarse pointer, sound off).
2. **Hiding the native cursor.** Replacing the system cursor feels laggy and trips some users up (low vision, cursor-size settings). I'd keep the native cursor and add the dot/ring and labels on top, never on text or inputs. If you'd rather drop it, the site loses very little.
3. **Line-by-line heading reveals.** Covered in 3.2: a single mask reveal gives the effect without layout-measurement risk.
4. **Boot moment vs. LCP.** Fine as specified (headline stays in the HTML) but it's the riskiest item for the ≥ 90 mobile target. It must render without causing layout shift, so it gets a reserved line height. If Lighthouse drops, I'll cut it first.
5. **Accessibility 100 with a full-viewport canvas and many animated overlays** is achievable only if contrast and focus order hold in both themes; I'll fix whatever the audit finds rather than promise 100 up front.

## Decisions needed

1. **Trace dates are the blocker for item 1.1.** Almost every span currently depends on guessed dates (TCS end, Virtusa start, Flowsmith, llm-gateway, statement-analyzer starts). If invalid spans are hidden, the trace shrinks to the root span and certifications until real dates exist. Options: (a) you send the real months now and I use them; (b) ship with the reduced trace and add spans when you have them. Also confirm B.Tech handling (my pick: remove from waterfall, show as a caption).
2. **Approve `zod` 4.6.7** (exact pin). Alternative is hand-written validators with no dependency, which is less impressive to a reviewer but zero cost.
3. **Contact placeholders:** job titles and descriptions for TCS/Virtusa stay empty and hidden until you provide them. Fine?
4. **Live-request span color.** The four accents have fixed meanings; I'd draw request spans in neutral `ink` at low opacity with a dashed outline, so they never read as a fifth category.
5. **Lighthouse:** I can't run it from here without installing it. Options: PageSpeed Insights API (Google's hosted Lighthouse, no install, measures the live URL) for before/after, or you run it in DevTools. I'd use PageSpeed Insights, which means pushing to `main` and measuring the deployed build.
6. **Section-trace bars:** just Projects, Experience, Contact (as specified), or also include the new Payment flow and Stack sections?
