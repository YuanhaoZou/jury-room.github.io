import type { Persona, PhraseMatch } from "../types";
import { personaTriggered } from "../utils";
import { JuryMember } from "./JuryMember";

export function JuryPane({
  personas,
  matches,
  chaosLevel,
}: {
  personas: Persona[];
  matches: PhraseMatch[];
  chaosLevel: number;
}) {
  const upsetCount = personas.filter(
    (p) => personaTriggered(p, matches).length > 0,
  ).length;

  return (
    <section className="pane">
      <div className="pane-bar">
        <h2>The jury kitchen</h2>
        <div className="spacer" />
        <span className="hint">Chaos {chaosLevel}%</span>
        <span className="hint">
          {upsetCount}/{personas.length} upset
        </span>
      </div>
      <div className="pane-body">
        <div className="jury-grid">
          {personas.map((persona) => {
            const hits = personaTriggered(persona, matches);
            return (
              <JuryMember
                key={persona.id}
                persona={persona}
                upset={hits.length > 0}
                hitCount={hits.length}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
