"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { notFound as copy } from "@/lib/content";
import { highlightLine, type TokenKind } from "@/lib/highlight";

const tone: Record<TokenKind, string> = {
  key: "text-iris",
  string: "text-teal",
  number: "text-amber",
  literal: "text-coral",
  punct: "text-muted",
  plain: "text-ink",
};

export default function NotFound() {
  const path = usePathname();
  // Same error shape as the JSON API.
  const body = JSON.stringify({ error: { code: copy.error.code, message: `No route for ${path}.` } }, null, 2);

  return (
    <main className="mx-auto flex min-h-screen max-w-content flex-col justify-center px-5 py-24 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.heading}</h1>
      <div className="mt-8 max-w-2xl rounded-panel border border-line bg-surface p-5 font-mono text-sm sm:p-6">
        <p className="break-all text-ink">
          <span className="text-teal">$</span> curl {path}
        </p>
        <p className="mt-2 text-coral">404 Not Found</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-[13px] leading-relaxed">
          {body.split("\n").map((line, i) => (
            <div key={i}>
              {highlightLine(line).map((t, j) => (
                <span key={j} className={tone[t.kind]}>
                  {t.text}
                </span>
              ))}
            </div>
          ))}
        </pre>
      </div>
      <Link
        href="/"
        className="mt-8 w-fit rounded-full bg-ink px-5 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
      >
        {copy.home}
      </Link>
    </main>
  );
}
