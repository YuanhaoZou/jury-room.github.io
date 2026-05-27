export type PersonaColor =
  | "purple"
  | "green"
  | "yellow"
  | "pink"
  | "blue"
  | "orange"
  | "gray";

export type PersonaArchetype =
  | "veteran"
  | "genz"
  | "exec"
  | "advocate"
  | "builder";

export type Persona = {
  id: string;
  name: string;
  /** Natural-language persona description; drives archetype, triggers, and lines. */
  vibe: string;
  demographic: string;
  color: PersonaColor;
  calmLine: string;
  upsetLine: string;
  archetype: PersonaArchetype;
};

export type PhraseMatch = {
  start: number;
  end: number;
  personaId: string;
  color: PersonaColor;
  phrase: string;
};
