import { useMemo } from "react";
import { colorPalette } from "../theme";
import { deriveTriggers } from "../personality";
import type { Persona } from "../types";

export function TriggerPanel({
  persona,
  copy,
  setCopy,
  onClose,
}: {
  persona: Persona;
  copy: string;
  setCopy: (next: string) => void;
  onClose: () => void;
}) {
  const accent = colorPalette[persona.color];

  const triggers = useMemo(
    () => deriveTriggers(persona, copy),
    [persona, copy],
  );

  const lowerCopy = copy.toLowerCase();

  const appendTrigger = (phrase: string) => {
    const trimmed = copy.trimEnd();
    const sep = trimmed.endsWith(".") || trimmed.endsWith("!") ? " " : ". ";
    setCopy(`${trimmed}${sep}${phrase}`);
  };

  return (
    <div
      className="trigger-panel"
      style={{ borderColor: accent }}
      role="region"
      aria-label={`${persona.name} triggers`}
    >
      <div className="trigger-panel-head">
        <span
          className="swatch"
          style={{ background: accent }}
          aria-hidden
        />
        <strong>{persona.name}</strong>
        <span className="hint">— click a phrase to add it to your copy</span>
        <div className="spacer" />
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onClose}
          aria-label="Close trigger panel"
        >
          Close
        </button>
      </div>
      <div className="trigger-chips">
        {triggers.map((phrase) => {
          const alreadyIn = lowerCopy.includes(phrase.toLowerCase());
          return (
            <button
              key={phrase}
              type="button"
              className={`trigger-chip${alreadyIn ? " trigger-chip--active" : ""}`}
              style={{
                borderColor: accent,
                background: alreadyIn ? accent : "transparent",
                color: alreadyIn ? "var(--accent-fg)" : accent,
              }}
              onClick={() => appendTrigger(phrase)}
              title={alreadyIn ? "Already in your copy — click to add again" : "Click to append to copy"}
            >
              {phrase}
              {alreadyIn && <span aria-hidden> ✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
