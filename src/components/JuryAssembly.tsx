import { useState } from "react";
import { DEFAULT_JURY_BRIEF } from "../data";
import { assembleJuryFromBrief } from "../personality";
import type { Persona } from "../types";

export function JuryAssembly({
  personas,
  onAssemble,
}: {
  personas: Persona[];
  onAssemble: (next: Persona[]) => void;
}) {
  const [brief, setBrief] = useState(() =>
    personas.map((p) => p.vibe).join("\n"),
  );
  const handleAssemble = () => {
    const next = assembleJuryFromBrief(brief, personas);
    onAssemble(next.length ? next : personas);
  };

  const loadExample = () => {
    setBrief(DEFAULT_JURY_BRIEF);
  };

  return (
    <section className="vibe-assembly" aria-label="Jury vibe assembly">
      <div className="vibe-assembly-header">
        <h2 className="vibe-assembly-title">Vibe-code your jury</h2>
        <p className="vibe-assembly-sub">
          Describe who should judge your copy in plain English — one persona per
          line. The personality model picks avatar style, sensitivities, and
          reaction lines for you.
        </p>
      </div>
      <textarea
        className="textarea vibe-assembly-input"
        rows={5}
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder={`Example:
A skeptical enterprise buyer who hates "beta" and vague security claims
A Gen Z user allergic to synergy and webinar energy
An accessibility advocate triggered by "click here" and "simply"`}
        spellCheck
      />
      <div className="vibe-assembly-actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleAssemble}
          disabled={!brief.trim()}
        >
          Assemble jury
        </button>
        <button type="button" className="btn btn--ghost" onClick={loadExample}>
          Load example brief
        </button>
        <span className="hint">
          {parseLineCount(brief)} persona{parseLineCount(brief) === 1 ? "" : "s"}{" "}
          detected
        </span>
      </div>
    </section>
  );
}

function parseLineCount(brief: string): number {
  const trimmed = brief.trim();
  if (!trimmed) return 0;
  const lines = trimmed.split(/\n+/).filter((l) => l.trim().length >= 8);
  return lines.length || 1;
}
