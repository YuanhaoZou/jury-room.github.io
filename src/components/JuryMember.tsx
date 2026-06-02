import type { Persona } from "../types";
import { colorPalette } from "../theme";
import { ChefSprite } from "./ChefSprite";

export function JuryMember({
  persona,
  upset,
  hitCount,
  selected,
  onClick,
}: {
  persona: Persona;
  upset: boolean;
  hitCount: number;
  selected: boolean;
  onClick: () => void;
}) {
  const line = upset ? persona.upsetLine : persona.calmLine;
  const accent = colorPalette[persona.color];
  const borderColor = selected
    ? accent
    : upset
      ? accent
      : "var(--stroke-secondary)";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`juror-card${upset ? " juror-card--upset" : ""}${selected ? " juror-card--selected" : ""}`}
      style={{
        borderColor,
        boxShadow: selected ? `0 0 0 2px ${accent} inset` : undefined,
        cursor: "pointer",
      }}
      aria-pressed={selected}
    >
      <div className="juror-card-inner">
        <div className="juror-top">
          <div className={upset ? "jury-panic" : "jury-calm"}>
            <ChefSprite
              archetype={persona.archetype}
              color={persona.color}
              upset={upset}
            />
          </div>
          <div className="juror-meta">
            <div className="juror-name-row">
              <span
                className="swatch"
                style={{ background: accent }}
              />
              <span className="juror-name">{persona.name}</span>
              {hitCount > 0 && (
                <span className="hint">
                  {hitCount} hit{hitCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <div className="juror-demo">{persona.demographic}</div>
          </div>
        </div>
        <div className={`bubble${upset ? " bubble--upset" : ""}`}>{line}</div>
        <div className="juror-hint hint">
          {selected ? "↓ triggers below" : "click for triggers"}
        </div>
      </div>
    </article>
  );
}
