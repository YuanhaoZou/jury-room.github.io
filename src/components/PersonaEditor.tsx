import { useMemo } from "react";
import { ARCHETYPE_OPTIONS, COLOR_OPTIONS } from "../data";
import {
  applyVibeToPersona,
  deriveTriggers,
  inferArchetype,
} from "../personality";
import type { Persona, PersonaArchetype, PersonaColor } from "../types";
import { colorPalette } from "../theme";
import { ChefSprite } from "./ChefSprite";

export function PersonaEditor({
  persona,
  copy,
  onChange,
  onRemove,
}: {
  persona: Persona;
  copy: string;
  onChange: (next: Persona) => void;
  onRemove: () => void;
}) {
  const sensitivities = useMemo(
    () => deriveTriggers(persona, copy),
    [persona, copy],
  );
  const previewArchetype = inferArchetype(persona.vibe);

  return (
    <div className="editor-card">
      <div className="editor-card-header">
        <div className="editor-card-title">
          <ChefSprite
            archetype={persona.archetype}
            color={persona.color}
            upset={false}
          />
          <span>{persona.name || "New juror"}</span>
        </div>
        <button
          type="button"
          className="icon-btn"
          title="Remove juror"
          onClick={onRemove}
          aria-label="Remove juror"
        >
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <path
              d="M3 3l6 6M9 3L3 9"
              stroke="currentColor"
              strokeWidth={1.4}
            />
          </svg>
        </button>
      </div>
      <div className="editor-card-body">
        <label className="field">
          <span className="label">Vibe</span>
          <textarea
            className="textarea vibe-field"
            rows={3}
            value={persona.vibe}
            onChange={(e) => onChange({ ...persona, vibe: e.target.value })}
            onBlur={(e) => onChange(applyVibeToPersona(persona, e.target.value))}
            placeholder="e.g. Enterprise buyer who hates beta launches and vague security claims"
          />
          <span className="hint">
            Personality model infers avatar &amp; triggers — no manual phrase
            lists.
          </span>
        </label>
        <div className="editor-row-2">
          <label className="field">
            <span className="label">Display name</span>
            <input
              className="input"
              value={persona.name}
              onChange={(e) => onChange({ ...persona, name: e.target.value })}
              placeholder="Pat"
            />
          </label>
          <label className="field">
            <span className="label">Role label</span>
            <input
              className="input"
              value={persona.demographic}
              onChange={(e) =>
                onChange({ ...persona, demographic: e.target.value })
              }
              placeholder="Old-school PM (15 yrs)"
            />
          </label>
        </div>
        <div className="editor-row-2">
          <label className="field">
            <span className="label">Highlight color</span>
            <select
              className="select"
              value={persona.color}
              onChange={(e) =>
                onChange({
                  ...persona,
                  color: e.target.value as PersonaColor,
                })
              }
            >
              {COLOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="label">
              Avatar style
              {previewArchetype !== persona.archetype && (
                <span className="label-hint"> → {previewArchetype}</span>
              )}
            </span>
            <select
              className="select"
              value={persona.archetype}
              onChange={(e) =>
                onChange({
                  ...persona,
                  archetype: e.target.value as PersonaArchetype,
                })
              }
            >
              {ARCHETYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="field">
          <span className="label">Auto sensitivities</span>
          <div className="sensitivity-chips">
            {sensitivities.length ? (
              sensitivities.map((t) => (
                <span
                  key={t}
                  className="tag tag--auto"
                  style={{
                    borderBottom: `2px solid ${colorPalette[persona.color]}`,
                  }}
                  title="Inferred by personality model from vibe + copy"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="hint">Add a vibe — sensitivities appear here.</span>
            )}
          </div>
        </div>
        <div className="editor-row-2">
          <label className="field">
            <span className="label">Calm line</span>
            <input
              className="input"
              value={persona.calmLine}
              onChange={(e) =>
                onChange({ ...persona, calmLine: e.target.value })
              }
            />
          </label>
          <label className="field">
            <span className="label">Upset line</span>
            <input
              className="input"
              value={persona.upsetLine}
              onChange={(e) =>
                onChange({ ...persona, upsetLine: e.target.value })
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
}
