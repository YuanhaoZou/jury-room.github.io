import { useEffect, useMemo } from "react";
import {
  COLOR_OPTIONS,
  DEFAULT_COPY,
  DEFAULT_PERSONAS,
} from "./data";
import { usePersistedState } from "./hooks/usePersistedState";
import {
  compilePersonaFromVibe,
  migratePersonas,
} from "./personality";
import type { Persona } from "./types";
import { findMatches, personaTriggered, uid } from "./utils";
import { JuryPane } from "./components/JuryPane";
import { JuryAssembly } from "./components/JuryAssembly";
import { PersonaEditor } from "./components/PersonaEditor";
import { FloatingDesktop } from "./components/FloatingDesktop";
import { ProductWebsitePane } from "./components/ProductWebsitePane";

export default function App() {
  const [copy, setCopy] = usePersistedState("jury-room:copy", DEFAULT_COPY);
  const [personas, setPersonas] = usePersistedState<Persona[]>(
    "jury-room:personas",
    DEFAULT_PERSONAS,
  );
  const [editMode, setEditMode] = usePersistedState("jury-room:editMode", false);
  const [customizeOpen, setCustomizeOpen] = usePersistedState(
    "jury-room:customizeOpen",
    false,
  );

  useEffect(() => {
    setPersonas((list) => {
      const migrated = migratePersonas(list);
      return JSON.stringify(migrated) === JSON.stringify(list) ? list : migrated;
    });
  }, [setPersonas]);

  const matches = useMemo(
    () => findMatches(copy, personas),
    [copy, personas],
  );

  const chaosLevel = useMemo(() => {
    if (!personas.length) return 0;
    const upset = personas.filter(
      (p) => personaTriggered(p, matches).length > 0,
    ).length;
    return Math.round((upset / personas.length) * 100);
  }, [personas, matches]);

  const updatePersona = (id: string, next: Persona) => {
    setPersonas((list) => list.map((p) => (p.id === id ? next : p)));
  };

  const removePersona = (id: string) => {
    setPersonas((list) => list.filter((p) => p.id !== id));
  };

  const addPersona = () => {
    const color = COLOR_OPTIONS[personas.length % COLOR_OPTIONS.length].value;
    const compiled = compilePersonaFromVibe(
      "A thoughtful juror who watches for hype and hand-wavy product claims",
      { color },
    );
    setPersonas((list) => [
      ...list,
      { ...compiled, id: uid() },
    ]);
    setCustomizeOpen(true);
  };

  const resetDefaults = () => {
    setCopy(DEFAULT_COPY);
    setPersonas(DEFAULT_PERSONAS);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-text">
          <h1>Jury Room</h1>
          <p>
            Split-screen product copy with an Overcooked-style persona jury.
            Vibe-code who sits on the jury — sensitivities are inferred
            automatically.
          </p>
        </div>
        <div className="spacer" />
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setCustomizeOpen((o) => !o)}
        >
          {customizeOpen ? "Hide jury setup" : "Customize jury"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={resetDefaults}>
          Reset demo
        </button>
      </header>

      <FloatingDesktop
        personas={personas}
        websiteCopy={copy}
        onPushToWebsite={setCopy}
      />

      <div className="split">
        <ProductWebsitePane
          copy={copy}
          setCopy={setCopy}
          matches={editMode ? [] : matches}
          editMode={editMode}
          setEditMode={setEditMode}
        />
        <JuryPane personas={personas} matches={matches} chaosLevel={chaosLevel} />
      </div>

      {customizeOpen && (
        <div className="customize-panel">
          <JuryAssembly personas={personas} onAssemble={setPersonas} />
          <div className="customize-toolbar">
            <button type="button" className="btn btn--ghost" onClick={addPersona}>
              Add juror
            </button>
            <p className="hint customize-toolbar-hint">
              Edit a single vibe below, or rewrite the whole brief above and hit
              Assemble jury.
            </p>
          </div>
          <div className="editor-grid">
            {personas.map((persona) => (
              <PersonaEditor
                key={persona.id}
                persona={persona}
                copy={copy}
                onChange={(next) => updatePersona(persona.id, next)}
                onRemove={() => removePersona(persona.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
