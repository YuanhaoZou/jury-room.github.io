import type { ReactNode } from "react";
import type { PhraseMatch } from "../types";
import { colorPalette } from "../theme";

export function HighlightedCopy({
  content,
  matches,
}: {
  content: string;
  matches: PhraseMatch[];
}) {
  if (!matches.length) {
    return <div className="preview-copy">{content}</div>;
  }

  const breakpoints = new Set<number>([0, content.length]);
  for (const m of matches) {
    breakpoints.add(m.start);
    breakpoints.add(m.end);
  }
  const points = [...breakpoints].sort((a, b) => a - b);
  const nodes: ReactNode[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const slice = content.slice(start, end);
    const active = matches.filter((m) => m.start <= start && m.end >= end);
    if (!slice) continue;
    if (active.length === 0) {
      nodes.push(<span key={`t-${start}`}>{slice}</span>);
    } else {
      const primary = active[0];
      const tint = colorPalette[primary.color];
      nodes.push(
        <span
          key={`h-${start}`}
          className="highlight"
          title={active.map((a) => a.phrase).join(" · ")}
          style={{ borderBottom: `2px solid ${tint}` }}
        >
          {slice}
        </span>,
      );
    }
  }

  return <div className="preview-copy">{nodes}</div>;
}
