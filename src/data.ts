import type { Persona, PersonaArchetype, PersonaColor } from "./types";

export const COLOR_OPTIONS: { value: PersonaColor; label: string }[] = [
  { value: "purple", label: "Purple" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "pink", label: "Pink" },
  { value: "blue", label: "Blue" },
  { value: "orange", label: "Orange" },
  { value: "gray", label: "Gray" },
];

export const ARCHETYPE_OPTIONS: { value: PersonaArchetype; label: string }[] =
  [
    { value: "veteran", label: "Veteran" },
    { value: "genz", label: "Gen Z" },
    { value: "exec", label: "Executive" },
    { value: "advocate", label: "Advocate" },
    { value: "builder", label: "Builder" },
  ];

export const DEFAULT_JURY_BRIEF = `Pat, an old-school PM who hates buzzwords like "agentic harnesses" and "move fast break things"
Riley, a Gen Z early adopter allergic to corporate speak and webinars
Morgan, an enterprise buyer triggered by beta launches and "no credit card" promises
Alex, an accessibility advocate who flags vague words like "simply" and "click here"`;

export const DEFAULT_COPY = `FlowKitchen — Ship faster, taste better

We wire your product copy through agentic harnesses so every launch feels inevitable.

Features
- Real-time jury feedback on your landing page
- Persona sensitivities inferred from your vibe
- Highlighted risky phrases before you publish

Start free. No credit card.`;

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: "p-veteran",
    name: "Pat",
    vibe:
      'Old-school PM (15 yrs) who hates buzzwords like "agentic harnesses" and "move fast break things"',
    demographic: "Old-school PM (15 yrs)",
    color: "orange",
    calmLine: "Specs exist. Calm kitchen.",
    upsetLine: "Who removed the spec?!",
    archetype: "veteran",
  },
  {
    id: "p-genz",
    name: "Riley",
    vibe: "Gen Z early adopter allergic to corporate speak, synergy, and webinars",
    demographic: "Gen Z early adopter",
    color: "pink",
    calmLine: "This actually slaps.",
    upsetLine: "Corporate speak detected!",
    archetype: "genz",
  },
  {
    id: "p-exec",
    name: "Morgan",
    vibe:
      'Enterprise buyer triggered by beta launches, "coming soon", and "no credit card" hype',
    demographic: "Enterprise buyer",
    color: "blue",
    calmLine: "Procurement can breathe.",
    upsetLine: "Where is the SOC 2 badge?!",
    archetype: "exec",
  },
  {
    id: "p-advocate",
    name: "Alex",
    vibe:
      'Accessibility advocate who flags vague affordances like "click here", "simply", and "just"',
    demographic: "Accessibility advocate",
    color: "green",
    calmLine: "Inclusive copy. Nice.",
    upsetLine: "Vague affordances everywhere!",
    archetype: "advocate",
  },
];
