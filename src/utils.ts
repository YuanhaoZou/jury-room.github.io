import { deriveTriggers } from "./personality";
import type { Persona, PhraseMatch } from "./types";

export function uid(): string {
  return `p-${Math.random().toString(36).slice(2, 9)}`;
}

export function findMatches(content: string, personas: Persona[]): PhraseMatch[] {
  const lower = content.toLowerCase();
  const out: PhraseMatch[] = [];
  for (const persona of personas) {
    for (const raw of deriveTriggers(persona, content)) {
      const phrase = raw.trim();
      if (!phrase) continue;
      const needle = phrase.toLowerCase();
      let idx = 0;
      while (idx < lower.length) {
        const at = lower.indexOf(needle, idx);
        if (at === -1) break;
        out.push({
          start: at,
          end: at + phrase.length,
          personaId: persona.id,
          color: persona.color,
          phrase,
        });
        idx = at + 1;
      }
    }
  }
  return out.sort((a, b) => a.start - b.start || b.end - a.end);
}

export function personaTriggered(
  persona: Persona,
  matches: PhraseMatch[],
): PhraseMatch[] {
  return matches.filter((m) => m.personaId === persona.id);
}

export function bodyMatchesForCopy(
  copy: string,
  matches: PhraseMatch[],
): { headline: string; body: string; bodyMatches: PhraseMatch[] } {
  const nl = copy.indexOf("\n");
  if (nl === -1) {
    return { headline: copy, body: "", bodyMatches: [] };
  }
  const headline = copy.slice(0, nl);
  const body = copy.slice(nl + 1);
  const offset = nl + 1;
  const bodyMatches = matches
    .filter((m) => m.end > offset)
    .map((m) => ({
      ...m,
      start: Math.max(0, m.start - offset),
      end: m.end - offset,
    }))
    .filter((m) => m.start < body.length);
  return { headline, body, bodyMatches };
}
