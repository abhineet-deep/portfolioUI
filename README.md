# Portfolio

Single-page developer portfolio. Next.js (App Router), TypeScript (strict), Tailwind CSS 3, Framer Motion, Lenis, cmdk and next-themes. All dependency versions are pinned exactly.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check
npm run start      # serve the production build
```

## Edit content

Everything visible lives in `lib/content.ts`: name, summary, links, trace spans, projects, stack, jobs, certifications and the contact copy. Components only render from it.

Search for `TODO` in that file to find every placeholder. Spans marked `placeholder: true` draw their bar from a guessed date and hide their duration until you replace it with the real one (then remove the flag).

Colors are CSS variables in `app/globals.css` (`:root` for dark, `.light` for light) and are mapped to Tailwind in `tailwind.config.ts`. Accent meaning is fixed: teal = jobs, iris = overall/education, amber = certifications, coral = side projects.

## Deploy to Vercel

1. Set `site.url` in `lib/content.ts` to your production URL (used for Open Graph metadata).
2. Push the repo to GitHub and import it at vercel.com/new. The Next.js preset needs no configuration.
3. Or from the CLI: `npx vercel` for a preview, `npx vercel --prod` for production.

## API and terminal

The page has a small read-only JSON API (`app/api/*`, helpers in `lib/api/`): `GET /api/engineers/abhineet-deep`, `/api/projects`, `/api/projects/:slug`, `/api/health`, and `/api/openapi.json` (OpenAPI 3.1, generated from the Zod schemas). Responses are Zod-validated and carry `ETag`/`Cache-Control`, a measured `Server-Timing`, GET-only CORS, and a per-instance in-memory rate limit (429 + `Retry-After`). The terminal section calls it for real, and each request adds a live span to the hero trace.

## Content rules

Fields I don't know yet are left out of `lib/content.ts` (see the `// TODO` comments) and simply don't render. `npm run build` runs `scripts/check-content.mjs` first and fails if the word "TODO" appears inside a string in that file.

Set `NEXT_PUBLIC_SITE_URL` on Vercel to your production origin so metadata, the sitemap and JSON-LD use it. It falls back to the Vercel URL.

## 3D scenes

Three scenes share one fixed WebGL canvas (`components/three/SceneRoot.tsx`), loaded lazily after the page is idle. Each scene draws into a placeholder element (`SceneSlot`) using drei `View`.

- Hero "living architecture": data in `lib/architecture.ts` (nodes, edges, packet routes, which node a trace span lights up).
- LLM gateway card: mini router with failover; animates only while the card is hovered or focused.
- Monogram easter egg in the contact panel (screens 1280px and wider): drag to spin, double-click to scatter.

Colors are read from the CSS variables at runtime, so editing the tokens in `globals.css` recolors the scenes too. Without WebGL, on slow loads, or before the chunk arrives, the static SVG fallbacks in `components/three/fallbacks/` are shown.

## Notes

- Reduced motion: Lenis, the marquee, gateway packets and reactive letters are all off, and trace bars render at full width immediately.
- There is no ESLint setup; `npm run build` checks types only.
