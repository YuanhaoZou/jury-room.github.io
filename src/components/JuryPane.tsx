import type { Persona, PhraseMatch } from "../types";
import { personaTriggered } from "../utils";
import { JuryMember } from "./JuryMember";
import { TriggerPanel } from "./TriggerPanel";

export function JuryPane({
  personas,
  matches,
  chaosLevel,
  copy,
  setCopy,
  selectedPersonaId,
  setSelectedPersonaId,
}: {
  personas: Persona[];
  matches: PhraseMatch[];
  chaosLevel: number;
  copy: string;
  setCopy: (next: string) => void;
  selectedPersonaId: string | null;
  setSelectedPersonaId: (id: string | null) => void;
}) {
  const upsetCount = personas.filter(
    (p) => personaTriggered(p, matches).length > 0,
  ).length;

  const selectedPersona =
    personas.find((p) => p.id === selectedPersonaId) ?? null;

  const togglePersona = (id: string) => {
    setSelectedPersonaId(selectedPersonaId === id ? null : id);
  };

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
                selected={persona.id === selectedPersonaId}
                onClick={() => togglePersona(persona.id)}
              />
            );
          })}
        </div>
        {selectedPersona && (
          <TriggerPanel
            persona={selectedPersona}
            copy={copy}
            setCopy={setCopy}
            onClose={() => setSelectedPersonaId(null)}
          />
        )}
      </div>
    </section>
  );
}
