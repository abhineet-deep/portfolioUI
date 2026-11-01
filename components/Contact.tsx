"use client";

import { contact, footer, site } from "@/lib/content";
import { copyEmail } from "@/lib/scroll";
import { MagneticButton } from "./MagneticButton";
import { SceneSlot } from "./three/SceneSlot";
import { MonogramFallback } from "./three/fallbacks/MonogramFallback";

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const linkClass =
  "inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink";

export function Contact() {
  return (
    <>
      <section id={contact.id} className="scroll-mt-24 pb-20 pt-12">
        <div className="relative rounded-panel border border-line bg-surface p-8 sm:p-14">
          {/* Easter egg: drag to spin, double-click to scatter. Desktop only. */}
          <SceneSlot
            name="monogram"
            className="absolute right-10 top-1/2 hidden select-none h-56 w-60 -translate-y-1/2 xl:right-16 xl:block"
            fallback={<MonogramFallback />}
          />
          <h2 className="max-w-[20ch] text-4xl font-semibold tracking-tight sm:text-6xl">{contact.heading}</h2>
          <p className="mt-5 max-w-[60ch] text-lg text-muted">{contact.line}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton
              href={`mailto:${site.email}`}
              className="inline-block rounded-full bg-teal px-6 py-3.5 text-sm font-semibold text-bg"
            >
              {contact.emailCta}
            </MagneticButton>
            <button
              type="button"
              onClick={() => void copyEmail(site.email, contact.copied)}
              className="rounded-full border border-line px-6 py-3.5 text-sm text-ink transition-colors hover:border-muted"
            >
              {contact.copyCta}
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <a href={site.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <GitHubIcon /> GitHub
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <LinkedInIcon /> LinkedIn
            </a>
          </div>
        </div>
      </section>
      <footer className="pb-12 text-sm text-muted">{footer}</footer>
    </>
  );
}
