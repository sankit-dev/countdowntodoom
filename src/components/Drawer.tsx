import { useEffect, useState } from "react";
import {
  BY_ID, DOOM_ID, LANE_BY_ID, PHASES, TIER_LABEL, fmtMin, parentsOf, roadToDoom, tierOf,
} from "../data";

interface Props {
  id: string | null;
  watched: Set<string>;
  toggleWatched: (id: string) => void;
  onSelect: (id: string | null, travel?: boolean) => void;
  onClose: () => void;
}

export function Drawer({ id, watched, toggleWatched, onSelect, onClose }: Props) {
  // Keep the last title mounted while the drawer slides shut.
  const [shown, setShown] = useState(id);
  useEffect(() => { if (id) setShown(id); }, [id]);
  const t = shown ? BY_ID[shown] : null;
  if (!t) return <aside className="drawer" aria-hidden="true" />;

  const lane = LANE_BY_ID[t.lane];
  const isDoom = t.id === DOOM_ID;
  const road = roadToDoom(t.id);
  const from = parentsOf(t.id);
  const chip = (x: string) => (
    <button key={x} className="chip" style={{ ["--c" as string]: LANE_BY_ID[BY_ID[x].lane].color }} onClick={() => onSelect(x, true)}>
      {BY_ID[x].title}
    </button>
  );

  return (
    <aside className={`drawer${id ? " open" : ""}`} style={{ ["--c" as string]: isDoom ? "var(--doom)" : lane.color }} aria-hidden={!id}>
      <button className="drawer-x" onClick={onClose} aria-label="Close">×</button>
      <div className="drawer-scroll" key={t.id}>
        <p className="drawer-lane">{isDoom ? "The destination" : lane.name}</p>
        <h3>{t.title}</h3>
        <p className="drawer-meta">
          <span>{t.year}</span>
          {!isDoom && <span>{t.kind === "film" ? "Film" : t.kind === "series" ? "Series" : "Special"}</span>}
          {!isDoom && <span>{fmtMin(t.min)}</span>}
          <span>{t.phase ? PHASES[t.phase].name : "Legacy universe"}</span>
        </p>

        {!isDoom && (
          <div className="weight">
            <div className="pips" aria-label={`Importance ${t.imp} out of 10`}>
              {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < t.imp ? "on" : ""} />)}
            </div>
            <span>{TIER_LABEL[tierOf(t)]}</span>
          </div>
        )}

        <h4>{isDoom ? "What this is" : "Why it matters for Doomsday"}</h4>
        <p className="drawer-why">{t.why}</p>

        {!isDoom && (
          <>
            <h4>Its road to Doom</h4>
            {road ? (
              <ol className="road">
                {road.map((x) => (
                  <li key={x} className={x === DOOM_ID ? "end" : ""}>
                    <button onClick={() => onSelect(x, true)}>{BY_ID[x].title}</button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="dim">A side road — this story does not feed into Doomsday directly.</p>
            )}
          </>
        )}

        {from.length > 0 && (<><h4>{isDoom ? "Feeds in directly" : "Built on"}</h4><div className="chips">{from.map(chip)}</div></>)}
        {t.to.length > 0 && (<><h4>Leads into</h4><div className="chips">{t.to.map(chip)}</div></>)}
      </div>

      {!isDoom && (
        <button className={`btn seen-btn${watched.has(t.id) ? " is-seen" : ""}`} onClick={() => toggleWatched(t.id)}>
          {watched.has(t.id) ? "✓ Watched — tap to undo" : "Mark as watched"}
        </button>
      )}
    </aside>
  );
}
