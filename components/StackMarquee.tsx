import clsx from "clsx";
import { marqueeAccents, stack, stackGroups } from "@/lib/content";
import { accentBg } from "@/lib/accent";

// Only one copy of the stack is exposed to assistive tech (first set of the first row);
// every other visual copy is aria-hidden.
function Row({ items, dir, offset, exposed }: { items: string[]; dir: "left" | "right"; offset: number; exposed: boolean }) {
  // Content is rendered twice so translating by -50% loops seamlessly.
  const renderSet = (duplicate: boolean) => {
    const hidden = duplicate || !exposed;
    return (
    <ul className={clsx("flex shrink-0 items-center", hidden && "marquee-dup")} aria-hidden={hidden || undefined}>
      {items.map((item, i) => {
        const accent = marqueeAccents[(i + offset) % marqueeAccents.length] ?? "teal";
        return (
          <li
            key={item}
            data-groups={stackGroups.filter((g) => g.items.includes(item)).map((g) => g.id).join(" ")}
            className="flex items-center whitespace-nowrap font-mono text-sm text-muted transition-opacity duration-200"
          >
            <span className="px-5">{item}</span>
            <span aria-hidden="true" className={clsx("h-1.5 w-1.5 rounded-[2px]", accentBg[accent])} />
          </li>
        );
      })}
    </ul>
    );
  };

  return (
    <div className="marquee marquee-mask overflow-hidden py-2">
      <div className="marquee-track" data-dir={dir}>
        {renderSet(false)}
        {renderSet(true)}
      </div>
    </div>
  );
}

export function StackMarquee() {
  const reversed = [...stack].reverse();
  return (
    <section aria-label="Tech stack" className="border-y border-line py-4">
      <Row items={stack} dir="left" offset={0} exposed />
      <Row items={reversed} dir="right" offset={2} exposed={false} />
    </section>
  );
}
