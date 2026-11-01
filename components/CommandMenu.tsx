"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { contact, palette, site } from "@/lib/content";
import { PALETTE_EVENT, copyEmail, scrollToId } from "@/lib/scroll";

type Item = { label: string; keywords?: string[]; run: () => void };

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  const run = (fn: () => void) => () => {
    setOpen(false);
    // Let the dialog unlock page scroll before we move it.
    setTimeout(fn, 60);
  };

  const groups: { heading: string; items: Item[] }[] = [
    {
      heading: "Go to",
      items: [
        { label: "Projects", run: () => scrollToId("projects") },
        { label: "Experience", run: () => scrollToId("experience") },
        { label: "Contact", run: () => scrollToId("contact") },
        { label: "Top", run: () => scrollToId("top") },
      ],
    },
    {
      heading: "Actions",
      items: [
        { label: "Copy email", keywords: ["mail", "address"], run: () => void copyEmail(site.email, contact.copied) },
        { label: "Toggle theme", keywords: ["dark", "light"], run: () => setTheme(resolvedTheme === "light" ? "dark" : "light") },
      ],
    },
    {
      heading: "Links",
      items: [
        { label: "Open GitHub", run: () => window.open(site.github, "_blank", "noopener,noreferrer") },
        { label: "Open LinkedIn", run: () => window.open(site.linkedin, "_blank", "noopener,noreferrer") },
      ],
    },
  ];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      overlayClassName="fixed inset-0 z-[80] bg-bg/60 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[18vh] z-[81] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
    >
      <Command.Input
        placeholder={palette.placeholder}
        className="w-full border-b border-line bg-transparent px-4 py-3.5 text-base text-ink outline-none placeholder:text-muted"
      />
      <Command.List className="max-h-[50vh] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted">{palette.empty}</Command.Empty>
        {groups.map((g) => (
          <Command.Group
            key={g.heading}
            heading={g.heading}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted"
          >
            {g.items.map((it) => (
              <Command.Item
                key={it.label}
                value={it.label}
                keywords={it.keywords}
                onSelect={run(it.run)}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-ink data-[selected=true]:bg-iris/15 data-[selected=true]:text-iris"
              >
                {it.label}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
