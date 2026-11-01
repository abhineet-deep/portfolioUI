"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { paymentFlow, type FlowStepId } from "@/lib/content";
import { Reveal } from "./Reveal";

type Pt = { x: number; y: number };
type Box = Pt & { w: number; h: number };
type Layout = { w: number; h: number; nodes: Record<Exclude<FlowStepId, "retry">, Box>; retryCtrl: Pt; retryLabel: Pt };

const MAIN = ["client", "gateway", "idem", "payment", "queue", "ledger", "webhook"] as const;
type MainId = (typeof MAIN)[number];
type NodeId = MainId | "dlq";

// Two layouts of the same graph: a row on wide screens, a column on narrow ones.
function layoutFor(wide: boolean): Layout {
  if (wide) {
    const w = 112;
    const gap = 28;
    const y = 120;
    const x = (i: number) => 14 + i * (w + gap) + w / 2;
    const n = (i: number): Box => ({ x: x(i), y, w, h: 56 });
    return {
      w: 980,
      h: 330,
      nodes: {
        client: n(0), gateway: n(1), idem: n(2), payment: n(3), queue: n(4), ledger: n(5), webhook: n(6),
        dlq: { x: (x(4) + x(5)) / 2, y: 270, w: 132, h: 52 },
      },
      retryCtrl: { x: (x(4) + x(5)) / 2, y: 28 },
      retryLabel: { x: (x(4) + x(5)) / 2, y: 52 },
    };
  }
  const cx = 150;
  const n = (i: number): Box => ({ x: cx, y: 40 + i * 78, w: 170, h: 48 });
  return {
    w: 380,
    h: 40 + 6 * 78 + 50,
    nodes: {
      client: n(0), gateway: n(1), idem: n(2), payment: n(3), queue: n(4), ledger: n(5), webhook: n(6),
      dlq: { x: 322, y: n(5).y + 2, w: 92, h: 52 },
    },
    retryCtrl: { x: 28, y: (n(4).y + n(5).y) / 2 },
    retryLabel: { x: 52, y: (n(4).y + n(5).y) / 2 },
  };
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => lerp(lerp(a, c, t), lerp(c, b, t), t);

function useWide(): boolean {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return wide;
}

export function PaymentFlow() {
  const reduce = useReducedMotion() ?? false;
  const wide = useWide();
  const L = layoutFor(wide);
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const [fail, setFail] = useState(false);
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<FlowStepId | null>(null);
  const [failed, setFailed] = useState<NodeId | null>(null);
  const [visited, setVisited] = useState<Set<FlowStepId>>(new Set());
  const [selected, setSelected] = useState<FlowStepId | null>(null);
  const [caption, setCaption] = useState("");
  const [showPacket, setShowPacket] = useState(false);

  const token = useRef(0);
  const layoutRef = useRef(L);
  layoutRef.current = L;
  const ctrl = useRef<{ stop: () => void } | null>(null);

  // Stop any run that is still going when the section unmounts.
  useEffect(
    () => () => {
      token.current++;
      ctrl.current?.stop();
    },
    [],
  );

  const centre = (id: NodeId): Pt => {
    const b = layoutRef.current.nodes[id];
    return { x: b.x, y: b.y };
  };

  const run = useCallback(async () => {
    const me = ++token.current;
    const alive = () => token.current === me;
    ctrl.current?.stop();

    setRunning(true);
    setFailed(null);
    setVisited(new Set());
    setCaption("");
    const start = layoutRef.current.nodes.client;
    px.set(start.x);
    py.set(start.y);
    setShowPacket(!reduce);

    const mark = (id: FlowStepId) => setVisited((v) => new Set(v).add(id));
    const at = async (id: FlowStepId, hold = 160) => {
      setActive(id);
      setSelected(id);
      await sleep(reduce ? 650 : hold);
      mark(id);
    };
    const travel = async (path: (t: number) => Pt, dur: number) => {
      if (reduce) return;
      const c = animate(0, 1, {
        duration: dur,
        ease: "easeInOut",
        onUpdate: (t) => {
          const p = path(t);
          px.set(p.x);
          py.set(p.y);
        },
      });
      ctrl.current = c;
      await c;
    };
    const move = (a: NodeId, b: NodeId, dur = 0.5) => travel((t) => lerp(centre(a), centre(b), t), dur);
    const retryArc = (dur = 0.6) =>
      travel((t) => quad(centre("ledger"), layoutRef.current.retryCtrl, centre("queue"), t), dur);

    // Happy path up to the queue.
    for (let i = 0; i < MAIN.length; i++) {
      const id = MAIN[i] as MainId;
      if (i > 0) {
        await move(MAIN[i - 1] as MainId, id);
        if (!alive()) return;
      }
      await at(id);
      if (!alive()) return;
      if (fail && id === "queue") break;
    }

    if (fail) {
      // The ledger write fails twice (waits of 1 s, then 2 s), and the third failure sends it to the DLQ.
      const waits = [1, 2];
      for (let attempt = 0; attempt < 3; attempt++) {
        await move("queue", "ledger");
        if (!alive()) return;
        setActive("ledger");
        setSelected("ledger");
        setFailed("ledger");
        await sleep(reduce ? 650 : 300);
        if (!alive()) return;
        const wait = waits[attempt];
        if (wait === undefined) break;
        setCaption(paymentFlow.waiting(wait));
        setActive("retry");
        setSelected("retry");
        mark("retry");
        await retryArc();
        if (!alive()) return;
        setActive("queue");
        setFailed(null);
        await sleep(reduce ? 650 : wait * 550);
        if (!alive()) return;
      }
      await travel((t) => lerp(centre("ledger"), centre("dlq"), t), 0.6);
      if (!alive()) return;
      setFailed(null);
      await at("dlq", 200);
      setCaption(paymentFlow.doneFail);
    } else {
      setCaption(paymentFlow.doneOk);
    }

    if (!alive()) return;
    setActive(null);
    setShowPacket(false);
    setRunning(false);
  }, [fail, reduce, px, py]);

  const pick = (id: FlowStepId) => {
    if (!running) setSelected(id);
  };

  const info = selected ? paymentFlow.steps[selected] : null;

  const nodeState = (id: FlowStepId) => {
    if (failed === id) return "failed";
    if (active === id) return "active";
    if (id === "dlq" && visited.has("dlq")) return "failed";
    if (visited.has(id)) return "visited";
    return "idle";
  };

  const box = (id: NodeId) => L.nodes[id];
  const line = (a: NodeId, b: NodeId) => {
    // Connect box edges, not centres, so arrows stop at the node.
    const A = box(a);
    const B = box(b);
    const horizontal = Math.abs(A.y - B.y) < 1;
    if (horizontal) return `M${A.x + A.w / 2} ${A.y} L${B.x - B.w / 2} ${B.y}`;
    const down = B.y > A.y;
    return `M${A.x} ${A.y + (down ? A.h / 2 : -A.h / 2)} L${B.x} ${B.y + (down ? -B.h / 2 : B.h / 2)}`;
  };

  const retryPath = (() => {
    const a = box("ledger");
    const b = box("queue");
    return wide
      ? `M${a.x} ${a.y - a.h / 2} Q${L.retryCtrl.x} ${L.retryCtrl.y} ${b.x} ${b.y - b.h / 2}`
      : `M${a.x - a.w / 2} ${a.y} Q${L.retryCtrl.x} ${L.retryCtrl.y} ${b.x - b.w / 2} ${b.y}`;
  })();
  const dlqPath = wide
    ? `M${box("ledger").x} ${box("ledger").y + 28} L${box("dlq").x + 30} ${box("dlq").y - 26}`
    : `M${box("ledger").x + box("ledger").w / 2} ${box("ledger").y} L${box("dlq").x - box("dlq").w / 2} ${box("dlq").y}`;

  const nodeEl = (id: NodeId) => {
    const b = box(id);
    const st = nodeState(id);
    const label = paymentFlow.steps[id].label;
    const words = label.split(" ");
    const two = words.length > 1 && label.length > 12;
    const lines = two ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [label];
    return (
      <g
        key={id}
        role="button"
        tabIndex={0}
        aria-label={`${label}. ${paymentFlow.steps[id].text}`}
        aria-pressed={selected === id}
        onClick={() => pick(id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pick(id);
          }
        }}
        className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-iris [&:focus-visible>rect]:stroke-[3]"
        data-cursor="select"
      >
        <rect
          x={b.x - b.w / 2}
          y={b.y - b.h / 2}
          width={b.w}
          height={b.h}
          rx={14}
          strokeWidth={selected === id ? 2.5 : 1.5}
          className={clsx(
            "transition-colors duration-200",
            st === "idle" && "fill-surface stroke-line",
            st === "visited" && "fill-teal/10 stroke-teal/50",
            st === "active" && "fill-teal/20 stroke-teal",
            st === "failed" && "fill-coral/15 stroke-coral",
            selected === id && st === "idle" && "stroke-iris",
          )}
        />
        {lines.map((t, i) => (
          <text
            key={i}
            x={b.x}
            y={b.y + (lines.length === 1 ? 4.5 : i === 0 ? -3 : 12)}
            textAnchor="middle"
            className={clsx("select-none text-[13px]", st === "failed" ? "fill-coral" : "fill-ink")}
          >
            {t}
          </text>
        ))}
      </g>
    );
  };

  const retryBtn = (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${paymentFlow.steps.retry.label}. ${paymentFlow.steps.retry.text}`}
      aria-pressed={selected === "retry"}
      onClick={() => pick("retry")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick("retry");
        }
      }}
      className="cursor-pointer outline-none [&:focus-visible>text]:fill-iris"
      data-cursor="select"
    >
      <text
        x={L.retryLabel.x}
        y={L.retryLabel.y}
        textAnchor={wide ? "middle" : "start"}
        className={clsx("select-none font-mono text-[12px] transition-colors", active === "retry" || selected === "retry" ? "fill-coral" : "fill-muted")}
      >
        {paymentFlow.steps.retry.label}
      </text>
    </g>
  );

  return (
    <section id={paymentFlow.id} aria-labelledby="flow-heading" className="scroll-mt-24 py-24">
      <Reveal>
        <h2 id="flow-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {paymentFlow.heading}
        </h2>
      </Reveal>
      <p className="mt-3 max-w-[60ch] text-muted">{paymentFlow.intro}</p>

      <div className="mt-8 rounded-panel border border-line bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void run()}
            disabled={running}
            data-cursor="run"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {running ? paymentFlow.running : paymentFlow.send}
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={fail}
            onClick={() => setFail((f) => !f)}
            disabled={running}
            className="flex items-center gap-2.5 rounded-full border border-line px-4 py-2.5 text-sm text-ink transition-colors hover:border-muted disabled:opacity-50"
          >
            <span className={clsx("relative h-4 w-7 rounded-full transition-colors", fail ? "bg-coral" : "bg-line")} aria-hidden="true">
              <span className={clsx("absolute top-0.5 h-3 w-3 rounded-full bg-bg transition-all", fail ? "left-3.5" : "left-0.5")} />
            </span>
            {paymentFlow.simulate}
          </button>
        </div>

        <div className={clsx("mt-5 mx-auto w-full", wide ? "max-w-[61rem]" : "max-w-sm")}>
          <svg viewBox={`0 0 ${L.w} ${L.h}`} className="h-auto w-full" role="group" aria-label={paymentFlow.heading}>
            <defs>
              <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" className="fill-muted" />
              </marker>
              <marker id="flow-arrow-fail" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" className="fill-coral" />
              </marker>
            </defs>

            <g fill="none" strokeWidth="1.5">
              {MAIN.slice(1).map((id, i) => (
                <path key={id} d={line(MAIN[i] as MainId, id)} className="stroke-line" markerEnd="url(#flow-arrow)" />
              ))}
              <path d={retryPath} strokeDasharray="5 5" className="stroke-coral/70" markerEnd="url(#flow-arrow-fail)" />
              <path d={dlqPath} strokeDasharray="5 5" className="stroke-coral/70" markerEnd="url(#flow-arrow-fail)" />
            </g>

            {retryBtn}
            {([...MAIN, "dlq"] as NodeId[]).map(nodeEl)}

            {showPacket && <motion.circle cx={px} cy={py} r={7} className="fill-ink" aria-hidden="true" />}
          </svg>
        </div>

        <div className="mt-4 min-h-[4.5rem] rounded-card border border-line bg-bg/50 p-4" aria-live="polite">
          {info ? (
            <>
              <p className="font-mono text-sm text-teal">{info.label}</p>
              <p className="mt-1 max-w-[65ch] text-sm text-muted">{info.text}</p>
            </>
          ) : (
            <p className="text-sm text-muted">{paymentFlow.hint}</p>
          )}
          {caption && <p className="mt-2 text-sm text-ink">{caption}</p>}
        </div>
      </div>
    </section>
  );
}
