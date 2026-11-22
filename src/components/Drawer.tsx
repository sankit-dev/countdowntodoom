import { useEffect, useState } from "react";
import { useScrollLock } from "../scrollLock";
import { track } from "../analytics";
import {
  BY_ID, DOOM_ID, LANE_BY_ID, PHASES, TIER_INFO, TIER_LABEL, fmtMin, parentsOf, roadToDoom, tierOf, slugOf,
} from "../data";
import { PLOT } from "../story";
import { embedUrl, hasTrailers, searchUrl, useTrailer } from "../tmdb";
import { Poster, usePosters } from "../posters";

interface Props {
  id: string | null;
  watched: Set<string>;
  toggleWatched: (id: string) => void;
  onSelect: (id: string | null, travel?: boolean) => void;
  onClose: () => void;
}

/** An embedded trailer when TMDB is set up; otherwise a link out to YouTube. */
function Trailer({ id }: { id: string }) {
  const key = useTrailer(id);
  const [playing, setPlaying] = useState(false);
  useEffect(() => setPlaying(false), [id]);
  if (hasTrailers && key)
    return playing ? (
      <iframe className="drawer-video" src={embedUrl(key)} title="Trailer" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
    ) : (
      <button className="trailer" onClick={() => { setPlaying(true); track("trailer_play", { title: id, from: "panel" }); }}><i aria-hidden="true">▶</i> Play the trailer</button>
    );
  if (id === "doomsday" && !hasTrailers) return null;
  return (
    <a className="trailer" target="_blank" rel="noopener noreferrer" href={searchUrl(id)}>
      <i aria-hidden="true">▶</i> Trailer on YouTube
    </a>
  );
}

export function Drawer({ id, watched, toggleWatched, onSelect, onClose }: Props) {
  // Keep the last title mounted while the drawer slides shut.
  const posters = usePosters();
  const [shown, setShown] = useState(id);
  useEffect(() => { if (id) setShown(id); }, [id]);
  useScrollLock(!!id, "phone"); // on phones the panel covers the page, so the page mustn't scroll under it
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
    <>
    <div className={`drawer-backdrop${id ? " open" : ""}`} onClick={onClose} aria-hidden="true" />
    <aside className={`drawer${id ? " open" : ""}`} style={{ ["--c" as string]: isDoom ? "var(--doom)" : lane.color }} aria-hidden={!id}>
      <button className="drawer-x" onClick={onClose} aria-label="Close">×</button>
      <div className="drawer-scroll" key={t.id}>
        <div className="drawer-hero">
          <Poster className="drawer-hero-img" src={t.poster || posters[t.id]} />
          <div className="drawer-hero-text">
            <p className="drawer-lane">{isDoom ? "The big one" : lane.name}</p>
            <h3>{t.title}</h3>
          </div>
        </div>
        <p className="drawer-meta">
          <span>{t.year}</span>
          {!isDoom && <span>{t.kind === "film" ? "Film" : t.kind === "series" ? "Series" : "Special"}</span>}
          {!isDoom && <span>{fmtMin(t.min)}</span>}
          <span>{t.phase ? PHASES[t.phase].name : "Old X-Men universe"}</span>
        </p>

        <Trailer id={t.id} />

        {!isDoom && (
          <div className="weight" data-tier={tierOf(t)}>
            <div className="pips" aria-label={`Importance ${t.imp} out of 10`}>
              {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < t.imp ? "on" : ""} />)}
            </div>
            <span>{TIER_LABEL[tierOf(t)]} <small>{t.imp}/10</small></span>
            <p className="weight-info">{TIER_INFO[tierOf(t)]}</p>
          </div>
        )}

        {PLOT[t.id] && (<><h4>What happens</h4><p className="drawer-plot">{PLOT[t.id]}</p></>)}

        <h4>{isDoom ? "What it is" : "Why watch it before Doomsday"}</h4>
        <p className="drawer-why">{t.why}</p>
        {!isDoom && <a className="drawer-more" href={`./title/${slugOf(t)}/`}>Open the full page →</a>}

        {!isDoom && (
          <>
            <h4>How it leads to Doomsday</h4>
            {road ? (
              <ol className="road">
                {road.map((x) => (
                  <li key={x} className={x === DOOM_ID ? "end" : ""}>
                    <button onClick={() => onSelect(x, true)}>{BY_ID[x].title}</button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="dim">This one doesn't lead into Doomsday, it's just a side story.</p>
            )}
          </>
        )}

        {from.length > 0 && (<><h4>{isDoom ? "Leads straight into it" : "Comes after"}</h4><div className="chips">{from.map(chip)}</div></>)}
        {t.to.length > 0 && (<><h4>Leads into</h4><div className="chips">{t.to.map(chip)}</div></>)}
      </div>

      {!isDoom && (
        <div className="drawer-foot">
          <button className={`btn seen-btn${watched.has(t.id) ? " is-seen" : ""}`} onClick={() => toggleWatched(t.id)}>
            {watched.has(t.id) ? "✓ Watched, tap to undo" : "Mark as watched"}
          </button>
        </div>
      )}
    </aside>
    </>
  );
}
