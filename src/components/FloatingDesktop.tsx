import { useMemo } from "react";
import { usePersistedState } from "../hooks/usePersistedState";
import {
  defaultFloatingPosition,
  useDragPosition,
} from "../hooks/useDragPosition";
import type { Persona, PhraseMatch } from "../types";
import { findMatches, personaTriggered } from "../utils";
import { colorPalette } from "../theme";
import { ChefSprite } from "./ChefSprite";
import { HighlightedCopy } from "./HighlightedCopy";

const PANEL_W = 360;
const PANEL_H = 440;

export function FloatingDesktop({
  personas,
  websiteCopy,
  onPushToWebsite,
}: {
  personas: Persona[];
  websiteCopy: string;
  onPushToWebsite: (text: string) => void;
}) {
  const [minimized, setMinimized] = usePersistedState(
    "jury-room:float-minimized",
    false,
  );
  const [scratch, setScratch] = usePersistedState("jury-room:scratch", "");
  const [storedPos, setStoredPos] = usePersistedState(
    "jury-room:float-pos",
    defaultFloatingPosition(PANEL_W, PANEL_H),
  );

  const { pos, onPointerDown, onPointerMove, onPointerUp } = useDragPosition(
    storedPos,
    { width: PANEL_W, height: minimized ? 48 : PANEL_H },
  );

  const persistPos = () => setStoredPos(pos);

  const matches = useMemo(
    () => findMatches(scratch, personas),
    [scratch, personas],
  );

  const chaosLevel = useMemo(() => {
    if (!personas.length) return 0;
    const upset = personas.filter(
      (p) => personaTriggered(p, matches).length > 0,
    ).length;
    return Math.round((upset / personas.length) * 100);
  }, [personas, matches]);

  if (minimized) {
    const upsetCount = personas.filter(
      (p) => personaTriggered(p, matches).length > 0,
    ).length;
    return (
      <button
        type="button"
        className="floating-launcher"
        style={{ left: pos.x, top: pos.y }}
        onClick={() => setMinimized(false)}
        title="Open quick jury check"
        aria-label="Open quick jury check"
      >
        <span className="floating-launcher-icon" aria-hidden>
          ⚖️
        </span>
        <span className="floating-launcher-label">Quick check</span>
        {upsetCount > 0 && (
          <span className="floating-launcher-badge">{upsetCount}</span>
        )}
      </button>
    );
  }

  return (
    <aside
      className="floating-desktop"
      style={{ left: pos.x, top: pos.y, width: PANEL_W }}
      aria-label="Quick jury check"
    >
      <header
        className="floating-desktop-header"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => {
          onPointerUp(e);
          persistPos();
        }}
        onPointerCancel={onPointerUp}
      >
        <span className="floating-desktop-grab" aria-hidden>
          ⋮⋮
        </span>
        <span className="floating-desktop-title">Quick jury check</span>
        <span
          className={`floating-chaos${chaosLevel > 50 ? " floating-chaos--hot" : ""}`}
        >
          {chaosLevel}% chaos
        </span>
        <button
          type="button"
          className="icon-btn floating-icon-btn"
          onClick={() => {
            persistPos();
            setMinimized(true);
          }}
          aria-label="Minimize"
          title="Minimize"
        >
          −
        </button>
      </header>

      <div className="floating-desktop-body">
        <p className="hint floating-hint">
          Paste or type anything — your jury reacts live, separate from the
          website preview.
        </p>
        <textarea
          className="textarea floating-scratch"
          rows={6}
          value={scratch}
          onChange={(e) => setScratch(e.target.value)}
          placeholder="Paste an email, tweet, headline, or paragraph…"
          spellCheck
        />

        {scratch.trim() ? (
          <div className="floating-preview">
            <HighlightedCopy content={scratch} matches={matches} />
          </div>
        ) : null}

        <div className="floating-jury-strip" role="list">
          {personas.map((persona) => {
            const hits = personaTriggered(persona, matches);
            const upset = hits.length > 0;
            return (
              <div
                key={persona.id}
                className={`floating-juror${upset ? " floating-juror--upset" : ""}`}
                role="listitem"
                title={
                  upset
                    ? `${persona.name}: ${persona.upsetLine}`
                    : `${persona.name}: ${persona.calmLine}`
                }
              >
                <div className={upset ? "jury-panic" : "jury-calm"}>
                  <ChefSprite
                    archetype={persona.archetype}
                    color={persona.color}
                    upset={upset}
                  />
                </div>
                <span
                  className="floating-juror-dot"
                  style={{ background: colorPalette[persona.color] }}
                />
              </div>
            );
          })}
        </div>

        {matches.length > 0 && (
          <ul className="floating-hits">
            {summarizeMatches(matches).map((hit) => (
              <li key={hit.phrase}>
                <span
                  className="swatch"
                  style={{ background: colorPalette[hit.color] }}
                />
                <span className="floating-hit-phrase">"{hit.phrase}"</span>
              </li>
            ))}
          </ul>
        )}

        <div className="floating-actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setScratch(websiteCopy)}
          >
            Pull from site
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={!scratch.trim()}
            onClick={() => onPushToWebsite(scratch)}
          >
            Push to site
          </button>
        </div>
      </div>
    </aside>
  );
}

function summarizeMatches(
  matches: PhraseMatch[],
): { phrase: string; color: PhraseMatch["color"] }[] {
  const seen = new Set<string>();
  const out: { phrase: string; color: PhraseMatch["color"] }[] = [];
  for (const m of matches) {
    const key = m.phrase.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ phrase: m.phrase, color: m.color });
    if (out.length >= 5) break;
  }
  return out;
}
