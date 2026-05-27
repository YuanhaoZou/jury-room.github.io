import type { PhraseMatch } from "../types";
import { bodyMatchesForCopy } from "../utils";
import { colorPalette } from "../theme";
import { HighlightedCopy } from "./HighlightedCopy";

function CalloutLegend({ matches }: { matches: PhraseMatch[] }) {
  const byPersona = new Map<string, PhraseMatch[]>();
  for (const m of matches) {
    const list = byPersona.get(m.personaId) ?? [];
    list.push(m);
    byPersona.set(m.personaId, list);
  }

  return (
    <div className="legend">
      <div className="legend-title">Live highlights</div>
      {[...byPersona.entries()].map(([id, list]) => (
        <div key={id} className="legend-row">
          <span
            className="swatch"
            style={{ background: colorPalette[list[0].color] }}
          />
          <span>{list.map((m) => `"${m.phrase}"`).join(", ")}</span>
        </div>
      ))}
    </div>
  );
}

export function ProductWebsitePane({
  copy,
  setCopy,
  matches,
  editMode,
  setEditMode,
}: {
  copy: string;
  setCopy: (v: string) => void;
  matches: PhraseMatch[];
  editMode: boolean;
  setEditMode: (v: boolean) => void;
}) {
  const { headline, body, bodyMatches } = bodyMatchesForCopy(copy, matches);

  return (
    <section className="pane pane--left">
      <div className="pane-bar">
        <h2>Product site</h2>
        <div className="spacer" />
        <button
          type="button"
          className={`btn${editMode ? " btn--primary" : " btn--ghost"}`}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Preview" : "Edit copy"}
        </button>
      </div>

      {editMode ? (
        <div className="pane-body pane-body--editor">
          <p className="hint">
            Type or paste landing-page copy. Triggers update live on the jury.
          </p>
          <textarea
            className="textarea textarea--large"
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
          />
        </div>
      ) : (
        <div className="pane-body pane-body--preview">
          <h1 className="preview-headline">{headline}</h1>
          <HighlightedCopy content={body} matches={bodyMatches} />
          <div className="divider" />
          <div className="preview-actions">
            <button type="button" className="btn btn--primary">
              Get started
            </button>
            <button type="button" className="btn btn--ghost">
              See demo
            </button>
          </div>
          {matches.length > 0 && <CalloutLegend matches={matches} />}
        </div>
      )}
    </section>
  );
}
