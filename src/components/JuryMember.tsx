import type { Persona } from "../types";
import { colorPalette } from "../theme";
import { ChefSprite } from "./ChefSprite";

export function JuryMember({
  persona,
  upset,
  hitCount,
}: {
  persona: Persona;
  upset: boolean;
  hitCount: number;
}) {
  const line = upset ? persona.upsetLine : persona.calmLine;
  const borderColor = upset
    ? colorPalette[persona.color]
    : "var(--stroke-secondary)";

  return (
    <article
      className={`juror-card${upset ? " juror-card--upset" : ""}`}
      style={{ borderColor }}
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
                style={{ background: colorPalette[persona.color] }}
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
      </div>
    </article>
  );
}
