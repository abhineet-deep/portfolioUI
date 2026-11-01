import clsx from "clsx";
import {
  analyzerBars,
  flowsmithSteps,
  gatewayDiagram,
  projects,
  projectsSection,
  type Project,
} from "@/lib/content";
import { accentBorder, accentText } from "@/lib/accent";
import { SpotlightCard } from "./SpotlightCard";
import { Reveal } from "./Reveal";
import { SceneSlot } from "./three/SceneSlot";

function Header({ p }: { p: Project }) {
  return (
    <>
      <span className={clsx("w-fit rounded-full border px-2.5 py-0.5 text-xs", accentBorder[p.accent], accentText[p.accent])}>
        {p.status}
      </span>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{p.title}</h3>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted">{p.description}</p>
    </>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-xs text-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}

const PATHS = {
  in: "M104 110 H176",
  out: ["M244 110 C 290 110, 290 36, 336 36", "M244 110 H336", "M244 110 C 290 110, 290 184, 336 184"],
} as const;

function GatewayDiagram() {
  const ys = [36, 110, 184];
  return (
    <svg viewBox="0 0 440 220" className="h-full w-full text-muted" role="img" aria-label="Diagram: your app sends requests to a gateway, which routes them to model A, B or C">
      <g fill="none" stroke="rgb(var(--line))" strokeWidth="1.5">
        <path d={PATHS.in} />
        {PATHS.out.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className="font-mono" fontSize="11" textAnchor="middle">
        <rect x="8" y="92" width="96" height="36" rx="10" className="fill-bg stroke-line" />
        <text x="56" y="114" className="fill-muted">{gatewayDiagram.source}</text>
        <rect x="176" y="86" width="68" height="48" rx="12" className="fill-coral/15 stroke-coral" />
        <text x="210" y="114" className="fill-coral">{gatewayDiagram.hub}</text>
        {gatewayDiagram.targets.map((t, i) => (
          <g key={t}>
            <rect x="336" y={(ys[i] ?? 0) - 18} width="96" height="36" rx="10" className="fill-bg stroke-line" />
            <text x="384" y={(ys[i] ?? 0) + 4} className="fill-muted">{t}</text>
          </g>
        ))}
      </g>
      <g className="fill-coral" aria-hidden="true">
        <circle r="3.5" className="packet" style={{ offsetPath: `path("${PATHS.in}")` }} />
        {PATHS.out.map((d, i) => (
          <circle
            key={d}
            r="3.5"
            className="packet"
            style={{ offsetPath: `path("${d}")`, animationDelay: `${0.5 + i * 0.25}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

function AnalyzerChart() {
  return (
    <div className="mt-6 flex h-24 items-end gap-2" aria-hidden="true">
      {analyzerBars.map((h, i) => (
        <span
          key={i}
          className="abar flex-1 rounded-t-md bg-coral/70"
          style={{ height: `${h}%`, "--i": i } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function FlowPills() {
  return (
    <ol className="mt-6 flex flex-col items-start" aria-label="Automation steps">
      {flowsmithSteps.map((s, i) => (
        <li key={s} className="flex flex-col items-start">
          {i > 0 && <span aria-hidden="true" className="ml-6 h-4 w-px bg-coral/50" />}
          <span className="rounded-full border border-coral/40 bg-coral/10 px-3.5 py-1 text-sm text-ink">{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function Projects() {
  const { "llm-gateway": gateway, "statement-analyzer": analyzer, flowsmith, payments } = projects;
  return (
    <section id="projects" className="scroll-mt-24 py-24">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{projectsSection.heading}</h2>
      </Reveal>
      <p className="mt-3 max-w-[60ch] text-muted">{projectsSection.intro}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-6">
        <SpotlightCard accent={gateway.accent} label={gateway.title} tilt={false} className="md:col-span-4 md:row-span-2">
          <Header p={gateway} />
          <SceneSlot name="gateway" engageOnParent className="relative mt-6 aspect-[2/1] w-full max-w-lg" fallback={<GatewayDiagram />} />
          <Tags tags={gateway.tags} />
        </SpotlightCard>

        <SpotlightCard accent={analyzer.accent} label={analyzer.title} className="md:col-span-2">
          <Header p={analyzer} />
          <AnalyzerChart />
          <Tags tags={analyzer.tags} />
        </SpotlightCard>

        <SpotlightCard accent={flowsmith.accent} label={flowsmith.title} className="md:col-span-2">
          <Header p={flowsmith} />
          <FlowPills />
          <Tags tags={flowsmith.tags} />
        </SpotlightCard>

        <SpotlightCard accent={payments.accent} label={payments.title} className="md:col-span-6">
          <Header p={payments} />
          <Tags tags={payments.tags} />
        </SpotlightCard>
      </div>
    </section>
  );
}
