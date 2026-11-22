import { useEffect, useRef, useState } from "react";
import { track } from "../analytics";
import { BY_ID } from "../data";
import { CHAPTERS } from "../story";
import { Poster, usePosters } from "../posters";
import { embedUrl, hasTrailers, searchUrl, useTrailer } from "../tmdb";

// The "story so far" deck: one card per idea, in a casual catch-up voice.
// Cards come in three shapes (see cardStyle) so the deck doesn't look like a template.

/** A card's picture: the main film's poster, with its trailer one tap away. */
function Media({ film, on, poster }: { film: string; on: boolean; poster?: string }) {
  const key = useTrailer(on ? film : null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { if (!on) setPlaying(false); }, [on]);
  return (
    <div className="card-media">
      {playing && key ? (
        <iframe className="card-video" src={embedUrl(key)} title="Trailer" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <span className="card-poster"><Poster src={poster} /></span>
      )}
      {playing ? (
        <button className="play" onClick={() => setPlaying(false)}>Close trailer</button>
      ) : hasTrailers && key ? (
        <button className="play" onClick={() => { setPlaying(true); track("trailer_play", { title: film, from: "story" }); }}>▶ Play trailer</button>
      ) : !hasTrailers && film !== "doomsday" ? (
        <a className="play" href={searchUrl(film)} target="_blank" rel="noopener noreferrer">▶ Trailer on YouTube</a>
      ) : null}
    </div>
  );
}

/**
 * Cards aren't all the same: the incursion card is set apart as the key note,
 * one-paragraph cards are short and text only, the rest get the main film's poster.
 */
const cardStyle = (c: (typeof CHAPTERS)[number]) =>
  c.kind === "incursion" ? "card-note" : c.body.length === 1 ? "card-short" : "card-poster-card";

/** The "Watch it in" posters: one swipeable row, with dots when they don't all fit. */
function PosterRow({ ids, posters, onSelect }: { ids: string[]; posters: Record<string, string>; onSelect: (id: string | null, travel?: boolean) => void }) {
  const row = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [at, setAt] = useState(0);
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const onScroll = () => {
    const el = row.current!;
    const item = el.firstElementChild as HTMLElement | null;
    if (item) setAt(Math.round(el.scrollLeft / (item.offsetWidth + 10)));
  };
  return (
    <>
      <div className="card-posters" ref={row} onScroll={onScroll}>
        {ids.map((id) => (
          <button key={id} onClick={() => onSelect(id)} title={BY_ID[id].title}>
            <span><Poster src={BY_ID[id].poster || posters[id]} /></span>
            <b>{BY_ID[id].title}</b>
          </button>
        ))}
      </div>
      {overflow && (
        <div className="poster-dots" aria-hidden="true">
          {ids.map((id, i) => <i key={id} className={i === Math.min(at, ids.length - 1) ? "on" : ""} />)}
        </div>
      )}
    </>
  );
}

const SPOIL_KEY = "rtd.spoilers.ok";
const spoilersOk = () => { try { return localStorage.getItem(SPOIL_KEY) === "1"; } catch { return false; } };

export function Story({ onSelect }: { onSelect: (id: string | null, travel?: boolean) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  // The cards give away endings, so they stay blurred until you say you're fine with that.
  const [ok, setOk] = useState(spoilersOk);
  const reveal = () => {
    setOk(true);
    try { localStorage.setItem(SPOIL_KEY, "1"); } catch { /* fine, ask again next time */ }
    track("spoilers_shown");
  };
  const [active, setActive] = useState(0);
  const posters = usePosters();

  // Whichever card is mostly in view is the active one; only it animates.
  useEffect(() => {
    const el = scroller.current!;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { root: el, threshold: 0.6 }
    );
    el.querySelectorAll(".card").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  // One-time swipe hint on phones: the first time the cards come into view, the
  // deck nudges sideways and back, and a "Swipe for more" line shows until the
  // reader moves to another card.
  const [swiped, setSwiped] = useState(() => { try { return localStorage.getItem("rtd.swiped") === "1"; } catch { return false; } });
  useEffect(() => {
    if (active > 0 && !swiped) {
      setSwiped(true);
      try { localStorage.setItem("rtd.swiped", "1"); } catch { /* fine */ }
    }
  }, [active, swiped]);
  useEffect(() => {
    if (swiped || !ok) return;
    const el = scroller.current!;
    if (!window.matchMedia("(max-width: 720px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t1 = 0, t2 = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      // Snapping would turn a small nudge into a jump to card 2, so it's off for the moment.
      t1 = window.setTimeout(() => { el.style.scrollSnapType = "none"; el.scrollBy({ left: 70, behavior: "smooth" }); }, 500);
      t2 = window.setTimeout(() => {
        el.scrollTo({ left: 0, behavior: "smooth" });
        window.setTimeout(() => (el.style.scrollSnapType = ""), 600);
      }, 1100);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  }, [swiped, ok]);

  const go = (i: number) => {
    const el = scroller.current!;
    const card = el.querySelectorAll<HTMLElement>(".card")[Math.max(0, Math.min(CHAPTERS.length - 1, i))];
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  };

  return (
    <section id="story" className="story">
      <header className="story-head">
        <div>
          <h2>The story so far</h2>
        </div>
      </header>

      <div className={`spoiler${ok ? " ok" : ""}`} role="note">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2 1 21h22L12 2Zm0 4.2L19.5 19h-15L12 6.2ZM11 10v5h2v-5h-2Zm0 6v2h2v-2h-2Z"/></svg>
        <div>
          <b>Spoiler alert</b>
          <p>{ok
            ? "These cards give away how every MCU movie and show so far ends."
            : "These cards give away how every MCU movie and show so far ends. Watching for the first time? Skip to the watch plan and come back after."}</p>
          {!ok && (
            <div className="spoiler-actions">
              <button className="btn btn-primary" onClick={reveal}>Show me the story</button>
              <a className="btn" href="#planner">Skip to watch plan</a>
            </div>
          )}
        </div>
      </div>

      <div
        className={`deck${ok ? "" : " veiled"}`}
        ref={scroller}
        aria-hidden={!ok}
        tabIndex={ok ? 0 : -1}
        aria-label="Story cards. Use the arrow keys to move between them."
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
        }}
      >
        {CHAPTERS.map((c, i) => (
          <article key={c.kind} data-i={i} data-kind={c.kind} className={`card ${cardStyle(c)}${c.image ? " card-wide" : ""}${i === active ? " on" : ""}`}>
            <Media film={c.watch[c.watch.length - 1]} on={i === active}
              poster={c.image ? `${import.meta.env.BASE_URL}${c.image}` : BY_ID[c.watch[c.watch.length - 1]].poster || posters[c.watch[c.watch.length - 1]]} />
            <div className="card-text">
              <span className="card-n">{i + 1}<small> of {CHAPTERS.length}</small></span>
              <h3>{c.title}</h3>
              {c.body.map((p, k) => <p key={k}>{p}</p>)}
              <div className="card-watch">
                <span>Watch it in</span>
                <PosterRow ids={c.watch} posters={posters} onSelect={onSelect} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {ok && !swiped && <p className="swipe-hint" aria-hidden="true">Swipe for more →</p>}
      <div className="deck-nav">
        <button onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous card">←</button>
        <div className="dots">
          {CHAPTERS.map((c, i) => (
            <button key={c.kind} className={i === active ? "on" : ""} onClick={() => go(i)} aria-label={`Card ${i + 1}: ${c.title}`} />
          ))}
        </div>
        <button onClick={() => go(active + 1)} disabled={active === CHAPTERS.length - 1} aria-label="Next card">→</button>
      </div>
    </section>
  );
}
