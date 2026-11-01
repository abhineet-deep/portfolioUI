"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { terminal } from "@/lib/content";
import { highlightLine, type TokenKind } from "@/lib/highlight";
import { addLiveSpan } from "@/lib/liveSpans";
import { playSound } from "@/lib/sound";
import { RUN_API_EVENT, scrollToId } from "@/lib/scroll";
import { Reveal } from "./Reveal";

type Entry = {
  id: number;
  path: string;
  pending: boolean;
  status?: number;
  statusText?: string;
  ms?: number;
  headers?: [string, string][];
  body?: string;
  error?: string;
};

const SHOWN_HEADERS = ["content-type", "cache-control", "etag", "server-timing", "x-ratelimit-remaining", "retry-after"];
const MAX_ENTRIES = 8;

const tone: Record<TokenKind, string> = {
  key: "text-iris",
  string: "text-teal",
  number: "text-amber",
  literal: "text-coral",
  punct: "text-muted",
  plain: "text-ink",
};

/** "curl /api/x", "/api/x" or "api/x" -> "/api/x"; null when it isn't a same-origin /api/ path. */
function normalize(raw: string): string | null {
  const cleaned = raw.trim().replace(/^curl\s+/i, "");
  if (!cleaned || /\s/.test(cleaned)) return null;
  try {
    const url = new URL(cleaned.startsWith("/") ? cleaned : `/${cleaned}`, window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/")) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

function Body({ text, reduce }: { text: string; reduce: boolean }) {
  const lines = text.split("\n");
  const [shown, setShown] = useState(reduce ? lines.length : 0);

  useEffect(() => {
    if (reduce) return;
    // Type the response out over roughly half a second, whatever its length.
    const chunk = Math.max(1, Math.ceil(lines.length / 28));
    const id = setInterval(() => {
      setShown((n) => {
        if (n + chunk >= lines.length) {
          clearInterval(id);
          return lines.length;
        }
        return n + chunk;
      });
    }, 18);
    return () => clearInterval(id);
  }, [lines.length, reduce]);

  return (
    <pre className="mt-2 overflow-x-auto whitespace-pre font-mono text-[12.5px] leading-relaxed">
      {lines.slice(0, shown).map((line, i) => (
        <div key={i}>
          {highlightLine(line).map((t, j) => (
            <span key={j} className={tone[t.kind]}>
              {t.text}
            </span>
          ))}
        </div>
      ))}
    </pre>
  );
}

export function Terminal() {
  const reduce = useReducedMotion() ?? false;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [announce, setAnnounce] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const nextId = useRef(1);
  const outRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  // Show the newest request from its first line (status + headers), not the tail of a long body.
  const lastId = entries[entries.length - 1]?.id;
  useEffect(() => {
    const box = outRef.current;
    const el = box?.querySelector<HTMLElement>(`[data-entry="${lastId}"]`);
    if (box && el) box.scrollTop = el.offsetTop - 16;
  }, [lastId]);

  const patch = (id: number, p: Partial<Entry>) => setEntries((es) => es.map((e) => (e.id === id ? { ...e, ...p } : e)));

  const run = useCallback(async (raw: string) => {
    const id = nextId.current++;
    playSound("run");
    const path = normalize(raw);
    if (!path) {
      setEntries((es) => [...es, { id, path: raw.trim(), pending: false, error: terminal.invalid }].slice(-MAX_ENTRIES));
      setAnnounce(terminal.invalid);
      return;
    }
    history.current.push(path);
    cursor.current = -1;
    setEntries((es) => [...es, { id, path, pending: true }].slice(-MAX_ENTRIES));

    const t0 = performance.now();
    try {
      // no-store so every run is a real round trip rather than a browser-cache hit.
      const res = await fetch(path, { cache: "no-store", headers: { Accept: "application/json" } });
      const text = await res.text();
      const ms = Math.round(performance.now() - t0);
      let body = text;
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        /* not JSON: show as received */
      }
      const headers = SHOWN_HEADERS.flatMap((h) => {
        const v = res.headers.get(h);
        return v ? ([[h, v]] as [string, string][]) : [];
      });
      patch(id, { pending: false, status: res.status, statusText: res.statusText, ms, headers, body });
      addLiveSpan({ path, status: res.status, ms });
      setAnnounce(`GET ${path} returned ${res.status} ${res.statusText} in ${ms} milliseconds.`);
    } catch {
      patch(id, { pending: false, error: terminal.networkError });
      setAnnounce(terminal.networkError);
    }
  }, []);

  // The command palette can run a request by sending an event.
  useEffect(() => {
    const onRun = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      scrollToId(terminal.id);
      setValue("");
      void run(path);
    };
    window.addEventListener(RUN_API_EVENT, onRun);
    return () => window.removeEventListener(RUN_API_EVENT, onRun);
  }, [run]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    void run(value);
    setValue("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    if (e.key === "ArrowUp" && h.length) {
      e.preventDefault();
      cursor.current = cursor.current === -1 ? h.length - 1 : Math.max(0, cursor.current - 1);
      setValue(h[cursor.current] ?? "");
    } else if (e.key === "ArrowDown" && cursor.current !== -1) {
      e.preventDefault();
      cursor.current += 1;
      if (cursor.current >= h.length) {
        cursor.current = -1;
        setValue("");
      } else setValue(h[cursor.current] ?? "");
    } else if (e.key === "Escape") {
      setValue("");
    }
  };

  return (
    <section ref={rootRef} id={terminal.id} aria-labelledby="api-heading" className="scroll-mt-24 pb-24">
      <Reveal>
        <h2 id="api-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {terminal.heading}
      </h2>
      </Reveal>
      <p className="mt-3 max-w-[60ch] text-muted">{terminal.intro}</p>

      <div className="mt-8 rounded-panel border border-line bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Example requests">
          {terminal.presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => void run(p)}
              data-cursor="run"
              className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-iris/60 hover:text-ink"
            >
              curl {p}
            </button>
          ))}
        </div>

        <div
          ref={outRef}
          className="relative mt-4 max-h-[26rem] min-h-[9rem] overflow-y-auto rounded-card border border-line bg-bg/60 p-4 font-mono text-sm"
        >
          {entries.length === 0 && <p className="text-muted">{terminal.empty}</p>}
          {entries.map((e) => (
            <div key={e.id} data-entry={e.id} className="mb-5 last:mb-0">
              <p className="break-all text-ink">
                <span className="text-teal">$</span> curl {e.path}
              </p>
              {e.pending && <p className="mt-1 text-muted">…</p>}
              {e.error && <p className="mt-1 text-coral">{e.error}</p>}
              {e.status !== undefined && (
                <>
                  <p className="mt-2 text-[13px]">
                    <span className={clsx(e.status < 400 ? "text-teal" : "text-coral")}>
                      {e.status} {e.statusText}
                    </span>
                    <span className="text-muted"> · {e.ms} ms round trip</span>
                  </p>
                  {e.headers && e.headers.length > 0 && (
                    <dl className="mt-1 text-xs text-muted">
                      {e.headers.map(([k, v]) => (
                        <div key={k} className="break-all">
                          <dt className="inline text-iris/80">{k}</dt>
                          <dd className="inline">: {v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {e.body && <Body text={e.body} reduce={reduce} />}
                </>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="mt-3 flex items-center gap-2 font-mono text-sm">
          <label htmlFor="api-path" className="shrink-0 text-teal">
            $ curl
          </label>
          <input
            id="api-path"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            placeholder={terminal.placeholder}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-md border border-line bg-bg/60 px-3 py-2 text-ink placeholder:text-muted/70"
          />
          <button
            type="submit"
            data-cursor="run"
            className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-medium text-bg transition-opacity hover:opacity-90"
          >
            Run
          </button>
        </form>
        <p className="mt-2 text-xs text-muted">{terminal.hint}</p>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
    </section>
  );
}
