// Fails the build if the word TODO appears inside a string literal in lib/content.ts.
// Comments may contain TODO (that's where unknowns are tracked); strings would end up on the page.
import { readFileSync } from "node:fs";

const file = new URL("../lib/content.ts", import.meta.url);
const src = readFileSync(file, "utf8");

const hits = [];
let i = 0;
let line = 1;

while (i < src.length) {
  const c = src[i];
  const next = src[i + 1];

  if (c === "\n") {
    line++;
    i++;
  } else if (c === "/" && next === "/") {
    while (i < src.length && src[i] !== "\n") i++;
  } else if (c === "/" && next === "*") {
    i += 2;
    while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
      if (src[i] === "\n") line++;
      i++;
    }
    i += 2;
  } else if (c === '"' || c === "'" || c === "`") {
    const quote = c;
    const startLine = line;
    let text = "";
    i++;
    while (i < src.length && src[i] !== quote) {
      if (src[i] === "\\") {
        text += src[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (src[i] === "\n") {
        if (quote !== "`") break; // unterminated: bail out of this literal
        line++;
      }
      text += src[i++];
    }
    i++;
    if (/TODO/.test(text)) hits.push({ line: startLine, text: text.slice(0, 80) });
  } else {
    i++;
  }
}

if (hits.length) {
  console.error("\ncheck-content: 'TODO' would render on the page. Leave the field out and put the TODO in a comment instead:\n");
  for (const h of hits) console.error(`  lib/content.ts:${h.line}  "${h.text}"`);
  console.error("");
  process.exit(1);
}
console.log("check-content: no TODO in rendered strings.");
