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

export function Story({ onSelect }: { onSelect: (id: string | null, travel?: boolean) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
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
        <p className="story-warn">Spoilers for everything up to now, obviously.</p>
      </header>

      <div
        className="deck"
        ref={scroller}
        tabIndex={0}
        aria-label="Story cards. Use the arrow keys to move between them."
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
        }}
      >
        {CHAPTERS.map((c, i) => (
          <article key={c.kind} data-i={i} className={`card ${cardStyle(c)}${i === active ? " on" : ""}`}>
            {cardStyle(c) === "card-poster-card" && (
              <Media film={c.watch[c.watch.length - 1]} on={i === active} poster={BY_ID[c.watch[c.watch.length - 1]].poster || posters[c.watch[c.watch.length - 1]]} />
            )}
            <div className="card-text">
              <span className="card-n">{i + 1}<small> of {CHAPTERS.length}</small></span>
              <h3>{c.title}</h3>
              {c.body.map((p, k) => <p key={k}>{p}</p>)}
              <div className="card-watch">
                <span>Watch it in</span>
                <div className="card-posters">
                  {c.watch.map((id) => (
                    <button key={id} onClick={() => onSelect(id)} title={BY_ID[id].title}>
                      <span><Poster src={BY_ID[id].poster || posters[id]} /></span>
                      <b>{BY_ID[id].title}</b>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

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
