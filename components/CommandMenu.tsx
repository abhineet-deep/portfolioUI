"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { contact, palette, projects, site, stack, terminal } from "@/lib/content";
import { PALETTE_EVENT, copyEmail, runApi, scrollToId, toast } from "@/lib/scroll";
import { playSound, toggleSound, useSoundEnabled } from "@/lib/sound";

type Item = { id: string; label: string; hint?: string; keywords?: string[]; run: () => void };
type Group = { heading: string; items: Item[] };

// Two-key navigation shortcuts: press G, then the letter. They are shown as hints in the palette.
const CHORDS: Record<string, string> = { p: "projects", e: "experience", c: "contact", t: "top", a: terminal.id, f: "flow", s: "stack" };
const EGG = "sudo hire abhineet";

function isTyping(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { resolvedTheme, setTheme } = useTheme();
  const soundOn = useSoundEnabled();
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    let chord = false;
    let timer: ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (openRef.current || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const k = e.key.toLowerCase();
      if (chord) {
        chord = false;
        clearTimeout(timer);
        const target = CHORDS[k];
        if (target) {
          e.preventDefault();
          scrollToId(target);
        }
      } else if (k === "g") {
        chord = true;
        timer = setTimeout(() => (chord = false), 1000);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) playSound("open");
    else setSearch("");
  }, [open]);

  const close = (fn: () => void) => () => {
    setOpen(false);
    // Let the dialog release scroll lock before we move the page.
    setTimeout(fn, 60);
  };

  const groups: Group[] = useMemo(
    () => [
      {
        heading: "Go to",
        items: [
          { id: "projects", label: "Projects", hint: "G P", run: () => scrollToId("projects") },
          { id: "experience", label: "Experience", hint: "G E", run: () => scrollToId("experience") },
          { id: "contact", label: "Contact", hint: "G C", run: () => scrollToId("contact") },
          { id: "top", label: "Top", hint: "G T", run: () => scrollToId("top") },
          { id: "api", label: "Try the API", hint: "G A", keywords: ["terminal", "curl"], run: () => scrollToId(terminal.id) },
          { id: "flow", label: "Payment request flow", hint: "G F", keywords: ["idempotency", "queue"], run: () => scrollToId("flow") },
          { id: "stack", label: "Stack by area", hint: "G S", run: () => scrollToId("stack") },
        ],
      },
      {
        heading: "Projects",
        items: Object.values(projects).map((p) => ({
          id: `project-${p.id}`,
          label: p.title,
          keywords: [p.status, ...p.tags],
          run: () => scrollToId("projects"),
        })),
      },
      {
        heading: "Run API request",
        items: terminal.presets.map((path) => ({ id: `run-${path}`, label: `GET ${path}`, keywords: ["curl", "api", "request"], run: () => runApi(path) })),
      },
      {
        heading: "Actions",
        items: [
          { id: "copy", label: "Copy email", keywords: ["mail", "address"], run: () => void copyEmail(site.email, contact.copied) },
          { id: "theme", label: "Toggle theme", keywords: ["dark", "light"], run: () => setTheme(resolvedTheme === "light" ? "dark" : "light") },
          { id: "sound", label: soundOn ? "Turn sounds off" : "Turn sounds on", keywords: ["audio", "toggle sounds", "mute"], run: toggleSound },
        ],
      },
      {
        heading: "Stack",
        items: stack.map((s) => ({ id: `stack-${s}`, label: s, run: () => scrollToId("stack") })),
      },
      {
        heading: "Links",
        items: [
          { id: "gh", label: "Open GitHub", run: () => window.open(site.github, "_blank", "noopener,noreferrer") },
          { id: "li", label: "Open LinkedIn", run: () => window.open(site.linkedin, "_blank", "noopener,noreferrer") },
        ],
      },
    ],
    [resolvedTheme, setTheme, soundOn],
  );

  const egg = search.trim().toLowerCase() === EGG;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      overlayClassName="fixed inset-0 z-[80] bg-bg/60 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[18vh] z-[81] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
    >
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={palette.placeholder}
        className="w-full border-b border-line bg-transparent px-4 py-3.5 text-base text-ink outline-none placeholder:text-muted"
      />
      <Command.List className="max-h-[50vh] overflow-y-auto p-2">
        {!egg && <Command.Empty className="px-3 py-6 text-center text-sm text-muted">{palette.empty}</Command.Empty>}

        {egg && (
          <Command.Group forceMount heading="Terminal" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted">
            <Command.Item
              forceMount
              value={EGG}
              onSelect={close(() => {
                toast("Permission granted. Opening a conversation.");
                scrollToId("contact");
              })}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-ink data-[selected=true]:bg-iris/15 data-[selected=true]:text-iris"
            >
              <span className="font-mono text-teal">$</span> {EGG}
              <span className="mt-0.5 block font-mono text-xs text-muted">[sudo] password for recruiter: ********</span>
            </Command.Item>
          </Command.Group>
        )}

        {groups.map((g) => (
          <Command.Group
            key={g.heading}
            heading={g.heading}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted"
          >
            {g.items.map((it) => (
              <Command.Item
                key={it.id}
                value={`${g.heading} ${it.label}`}
                keywords={it.keywords}
                onSelect={close(it.run)}
                className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-ink data-[selected=true]:bg-iris/15 data-[selected=true]:text-iris"
              >
                <span className="min-w-0 truncate">{it.label}</span>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-muted">
                  {it.hint && <kbd className="rounded border border-line px-1.5 py-0.5">{it.hint}</kbd>}
                  <kbd className="hidden rounded border border-line px-1.5 py-0.5 group-data-[selected=true]:inline">↵</kbd>
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
      <div className="flex items-center gap-4 border-t border-line px-4 py-2 font-mono text-[10px] text-muted" aria-hidden="true">
        <span>↑↓ move</span>
        <span>↵ select</span>
        <span>esc close</span>
      </div>
    </Command.Dialog>
  );
}
