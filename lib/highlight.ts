export type TokenKind = "key" | "string" | "number" | "literal" | "punct" | "plain";
export type Token = { text: string; kind: TokenKind };

// One pass over a line of pretty-printed JSON. Strings followed by ":" are keys.
const RE = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],:])/g;

export function highlightLine(line: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of line.matchAll(RE)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: line.slice(last, at), kind: "plain" });
    if (m[1] !== undefined) {
      if (m[2] !== undefined) {
        out.push({ text: m[1], kind: "key" }, { text: m[2], kind: "punct" });
      } else {
        out.push({ text: m[1], kind: "string" });
      }
    } else if (m[3] !== undefined) out.push({ text: m[3], kind: "literal" });
    else if (m[4] !== undefined) out.push({ text: m[4], kind: "number" });
    else if (m[5] !== undefined) out.push({ text: m[5], kind: "punct" });
    last = at + m[0].length;
  }
  if (last < line.length) out.push({ text: line.slice(last), kind: "plain" });
  return out;
}
