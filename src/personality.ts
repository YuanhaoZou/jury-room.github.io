import type { Persona, PersonaArchetype, PersonaColor } from "./types";
import devonCorpus from "./data/devon-corpus.json";

type ArchetypeProfile = {
  keywords: string[];
  lexicon: string[];
  calmLines: string[];
  upsetLines: string[];
  defaultColor: PersonaColor;
  roleLabel: string;
};

const ARCHETYPE_PROFILES: Record<PersonaArchetype, ArchetypeProfile> = {
  veteran: {
    keywords: [
      "veteran",
      "old-school",
      "old school",
      "senior",
      "pm",
      "product manager",
      "15 year",
      "experienced",
      "spec",
      "process",
      "traditional",
    ],
    lexicon: [
      "agentic harnesses",
      "move fast break things",
      "10x engineer",
      "disrupt",
      "hack",
      "mvp",
      "pivot",
      "growth hack",
      "ship it",
      "no spec",
    ],
    calmLines: ["Specs exist. Calm kitchen.", "Process respected. Steady ship."],
    upsetLines: [
      "Who removed the spec?!",
      "That's not how we shipped in 2012!",
    ],
    defaultColor: "orange",
    roleLabel: "Seasoned PM",
  },
  genz: {
    keywords: [
      "gen z",
      "gen-z",
      "zoomer",
      "young",
      "early adopter",
      "tiktok",
      "creator",
      "chronically online",
    ],
    lexicon: [
      "synergy",
      "leverage",
      "paradigm shift",
      "webinar",
      "stakeholder alignment",
      "circle back",
      "thought leader",
      "best-in-class",
      "robust solution",
    ],
    calmLines: ["This actually slaps.", "No cringe detected. W."],
    upsetLines: [
      "Corporate speak detected!",
      "This copy is giving webinar.",
    ],
    defaultColor: "pink",
    roleLabel: "Gen Z early adopter",
  },
  exec: {
    keywords: [
      "enterprise",
      "exec",
      "executive",
      "buyer",
      "procurement",
      "cfo",
      "cto",
      "security",
      "compliance",
      "soc 2",
      "b2b",
    ],
    lexicon: [
      "beta",
      "coming soon",
      "free forever",
      "no credit card",
      "unlimited",
      "lifetime deal",
      "startup pricing",
      "trust us",
    ],
    calmLines: [
      "Procurement can breathe.",
      "Enterprise-ready tone. Approved.",
    ],
    upsetLines: [
      "Where is the SOC 2 badge?!",
      "This reads like a stealth beta!",
    ],
    defaultColor: "blue",
    roleLabel: "Enterprise buyer",
  },
  advocate: {
    keywords: [
      "accessibility",
      "a11y",
      "inclusive",
      "advocate",
      "wcag",
      "screen reader",
      "disability",
      "ux writer",
      "plain language",
    ],
    lexicon: [
      "click here",
      "simply",
      "just",
      "easy",
      "obviously",
      "everyone knows",
      "quickly",
      "effortless",
    ],
    calmLines: ["Inclusive copy. Nice.", "Clear affordances. Love it."],
    upsetLines: [
      "Vague affordances everywhere!",
      "That's not plain language!",
    ],
    defaultColor: "green",
    roleLabel: "Accessibility advocate",
  },
  builder: {
    keywords: [
      "engineer",
      "developer",
      "builder",
      "technical",
      "dev",
      "architect",
      "sre",
      "infra",
    ],
    lexicon: [
      "magic",
      "it just works",
      "black box",
      "no code required",
      "one click",
      "automatically",
      "ai-powered",
      "set and forget",
    ],
    calmLines: ["Technically honest. Ship it.", "Architecture checks out."],
    upsetLines: [
      "Where's the technical depth?!",
      "That hand-waves the hard parts!",
    ],
    defaultColor: "purple",
    roleLabel: "Technical builder",
  },
  skeptic: {
    keywords: [
      "engineer",
      "senior",
      "skeptic",
      "skeptical",
      "wary",
      "hesitant",
      "anti-ai",
      "anti ai",
      "ai-skeptic",
      "ai skeptic",
      "ai-averse",
      "code review",
      "copilot",
      "cursor",
      "ai tools",
      "vibe coding",
      "10 year",
      "principal",
      "staff",
    ],
    lexicon: devonCorpus.lexicon,
    calmLines: devonCorpus.calmLines,
    upsetLines: devonCorpus.upsetLines,
    defaultColor: "yellow",
    roleLabel: "Skeptical engineer",
  },
};

const VIBE_SPLIT =
  /\n+|(?:^|\n)\s*(?:\d+[.)]|[-*•])\s+|;(?=\s)|\s+and\s+(?=[A-Z"a-z])/;

const HATES_PATTERN =
  /\b(?:hates?|dislikes?|allergic to|triggered by|can't stand|sensitive to|watches for|flags?)\s+(.+?)(?:\.|,|;|$)/gi;

const QUOTED_PATTERN = /["“]([^"”]+)["”]/g;

function scoreArchetype(vibe: string, archetype: PersonaArchetype): number {
  const lower = vibe.toLowerCase();
  const profile = ARCHETYPE_PROFILES[archetype];
  let score = 0;
  for (const kw of profile.keywords) {
    if (lower.includes(kw)) score += kw.length > 4 ? 2 : 1;
  }
  return score;
}

export function inferArchetype(vibe: string): PersonaArchetype {
  const scores = (
    Object.keys(ARCHETYPE_PROFILES) as PersonaArchetype[]
  ).map((a) => ({ a, s: scoreArchetype(vibe, a) }));
  scores.sort((x, y) => y.s - x.s);
  return scores[0]?.s ? scores[0].a : "builder";
}

function pickLine(lines: string[], vibe: string): string {
  const lower = vibe.toLowerCase();
  for (const line of lines) {
    if (
      line.split(/\s+/).some((w) => w.length > 4 && lower.includes(w.toLowerCase()))
    ) {
      return line;
    }
  }
  return lines[Math.abs(hashString(vibe)) % lines.length];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function extractName(vibe: string): string | null {
  const named =
    /^(?:a\s+)?([A-Z][a-z]+)(?:,|\s+who|\s+—|\s+-|\s+the\s)/.exec(vibe.trim()) ??
    /^([A-Z][a-z]+)\s+(?:is|the)\s/.exec(vibe.trim());
  return named?.[1] ?? null;
}

function extractVibePhrases(vibe: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const hates = new RegExp(HATES_PATTERN.source, HATES_PATTERN.flags);
  while ((m = hates.exec(vibe)) !== null) {
    const chunk = m[1].trim();
    for (const part of chunk.split(/\s+and\s+|,\s*/)) {
      const p = part.trim().replace(/^["']|["']$/g, "");
      if (p.length >= 3) out.push(p);
    }
  }
  const quoted = new RegExp(QUOTED_PATTERN.source, QUOTED_PATTERN.flags);
  while ((m = quoted.exec(vibe)) !== null) {
    if (m[1].trim().length >= 3) out.push(m[1].trim());
  }
  return out;
}

function tokensFromVibe(vibe: string): string[] {
  const stop = new Set([
    "the",
    "a",
    "an",
    "who",
    "that",
    "with",
    "for",
    "and",
    "or",
    "is",
    "are",
    "very",
    "really",
    "person",
    "user",
    "juror",
  ]);
  return vibe
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3 && !stop.has(t));
}

/** Personality model: sensitivities from vibe + archetype, refined against live copy. */
export function deriveTriggers(persona: Persona, copy = ""): string[] {
  const archetype = inferArchetype(persona.vibe);
  const profile = ARCHETYPE_PROFILES[archetype];
  const vibe = persona.vibe.trim();
  const lowerCopy = copy.toLowerCase();
  const vibeTokens = new Set(tokensFromVibe(vibe));
  const scored = new Map<string, number>();

  const bump = (phrase: string, weight: number) => {
    const p = phrase.trim();
    if (p.length < 3) return;
    scored.set(p, (scored.get(p) ?? 0) + weight);
  };

  for (const phrase of extractVibePhrases(vibe)) {
    bump(phrase, 8);
  }

  for (const term of profile.lexicon) {
    let weight = 2;
    const termLower = term.toLowerCase();
    if (lowerCopy.includes(termLower)) weight += 5;
    for (const tok of vibeTokens) {
      if (termLower.includes(tok) || tok.includes(termLower.split(" ")[0] ?? "")) {
        weight += 3;
      }
    }
    if (vibe.toLowerCase().includes(termLower)) weight += 4;
    bump(term, weight);
  }

  for (const tok of vibeTokens) {
    if (tok.length >= 5) bump(tok, 1);
  }

  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([phrase]) => phrase);
}

export function compilePersonaFromVibe(
  vibe: string,
  partial?: Partial<Persona>,
): Omit<Persona, "id"> {
  const trimmed = vibe.trim();
  const archetype = inferArchetype(trimmed);
  const profile = ARCHETYPE_PROFILES[archetype];
  const name =
    partial?.name?.trim() ||
    extractName(trimmed) ||
    profile.roleLabel.split(" ")[0] ||
    "Juror";
  const demographic =
    partial?.demographic?.trim() ||
    (trimmed.length > 60 ? `${trimmed.slice(0, 57)}…` : trimmed) ||
    profile.roleLabel;

  const persona: Persona = {
    id: partial?.id ?? "",
    name,
    vibe: trimmed,
    demographic,
    color: partial?.color ?? profile.defaultColor,
    archetype: partial?.archetype ?? archetype,
    calmLine: partial?.calmLine ?? pickLine(profile.calmLines, trimmed),
    upsetLine: partial?.upsetLine ?? pickLine(profile.upsetLines, trimmed),
  };

  return persona;
}

export function applyVibeToPersona(persona: Persona, vibe: string): Persona {
  const compiled = compilePersonaFromVibe(vibe, {
    id: persona.id,
    name: persona.name,
    color: persona.color,
    calmLine: persona.calmLine,
    upsetLine: persona.upsetLine,
  });
  return { ...persona, ...compiled, vibe: vibe.trim() };
}

export function parseJuryBrief(brief: string): string[] {
  const trimmed = brief.trim();
  if (!trimmed) return [];
  const parts = trimmed
    .split(VIBE_SPLIT)
    .map((s) => s.replace(/^(?:\d+[.)]|[-*•])\s*/, "").trim())
    .filter((s) => s.length >= 8);
  return parts.length ? parts : [trimmed];
}

export function assembleJuryFromBrief(
  brief: string,
  existing: Persona[] = [],
): Persona[] {
  const vibes = parseJuryBrief(brief);
  const colors: PersonaColor[] = [
    "orange",
    "pink",
    "blue",
    "green",
    "purple",
    "yellow",
    "gray",
  ];
  return vibes.map((vibe, i) => {
    const partial = existing[i];
    const compiled = compilePersonaFromVibe(vibe, {
      id: partial?.id,
      name: partial?.name,
      color: partial?.color ?? colors[i % colors.length],
    });
    return {
      ...compiled,
      id: partial?.id ?? `p-${hashString(vibe + i).toString(36).slice(2, 9)}`,
      color: colors[i % colors.length],
    };
  });
}

export function migratePersona(raw: Record<string, unknown>): Persona {
  const archetype = (raw.archetype as PersonaArchetype) ?? "builder";
  const legacyTriggers = Array.isArray(raw.triggers)
    ? (raw.triggers as string[]).filter(Boolean)
    : [];
  const vibe =
    typeof raw.vibe === "string" && raw.vibe.trim()
      ? raw.vibe.trim()
      : [
          typeof raw.demographic === "string" ? raw.demographic : "",
          legacyTriggers.length
            ? `Sensitive to: ${legacyTriggers.slice(0, 4).join(", ")}`
            : "",
        ]
          .filter(Boolean)
          .join(". ") || "A thoughtful product juror";

  const base: Persona = {
    id: String(raw.id ?? `p-${Math.random().toString(36).slice(2, 9)}`),
    name: String(raw.name ?? "Juror"),
    vibe,
    demographic: String(raw.demographic ?? vibe.slice(0, 60)),
    color: (raw.color as PersonaColor) ?? ARCHETYPE_PROFILES[archetype].defaultColor,
    archetype,
    calmLine: String(raw.calmLine ?? ARCHETYPE_PROFILES[archetype].calmLines[0]),
    upsetLine: String(raw.upsetLine ?? ARCHETYPE_PROFILES[archetype].upsetLines[0]),
  };
  return applyVibeToPersona(base, vibe);
}

export function migratePersonas(raw: unknown): Persona[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p) =>
    migratePersona(typeof p === "object" && p ? (p as Record<string, unknown>) : {}),
  );
}
