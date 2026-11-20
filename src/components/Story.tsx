import { useEffect, useRef, useState } from "react";
import { track } from "../analytics";
import { BY_ID } from "../data";
import { CHAPTERS } from "../story";
import { Poster, usePosters } from "../posters";
import { embedUrl, hasTrailers, searchUrl, useTrailer } from "../tmdb";

// The "story so far" deck: one card per idea, each with a small looping
// diagram that plays while its card is the one in view.

const STONES = ["#4f8cff", "#ffd23f", "#ff4d4d", "#b05cff", "#3ddc84", "#ff9040"];
const fan = (n: number, spread: number) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * spread);

function Visual({ kind }: { kind: string }) {
  const common = { viewBox: "0 0 400 300", className: `viz viz-${kind}`, "aria-hidden": true } as const;
  switch (kind) {
    case "stones":
      return (
        <svg {...common}>
          {STONES.map((c, i) => (
            <circle key={c} className="stone" cx={100 + i * 40} cy={70} r={11} fill={c} style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
          {Array.from({ length: 60 }, (_, i) => (
            <circle key={i} className={(i * 7 + Math.floor(i / 12)) % 2 ? "soul gone" : "soul"} cx={68 + (i % 12) * 24} cy={150 + Math.floor(i / 12) * 24} r={4.5} />
          ))}
        </svg>
      );
    case "sacred":
      return (
        <svg {...common}>
          <path className="line main" d="M20 150H380" />
          {[90, 170, 250, 320].map((x, i) => (
            <g key={x} className="prune" style={{ animationDelay: `${i * 0.9}s` }}>
              <path className="line" d={`M${x} 150q30 ${i % 2 ? 60 : -60} 60 ${i % 2 ? 70 : -70}`} />
              <path className="cut" d={`M${x + 6} ${i % 2 ? 172 : 128}l14 ${i % 2 ? -14 : 14}`} />
            </g>
          ))}
        </svg>
      );
    case "fracture":
      return (
        <svg {...common}>
          <path className="line main" d="M20 150H150" />
          <circle className="spark" cx="150" cy="150" r="7" />
          {fan(11, 24).map((dy, i) => (
            <path key={i} className="line grow" pathLength={1} style={{ animationDelay: `${0.5 + Math.abs(i - 5) * 0.12}s` }}
              d={`M150 150C230 150 250 ${150 + dy} 380 ${150 + dy * 1.15}`} />
          ))}
        </svg>
      );
    case "multiverse":
      return (
        <svg {...common}>
          {[60, 105, 150, 195, 240].map((y, i) => (
            <g key={y}>
              <path className="line drift" style={{ animationDelay: `${-i * 0.7}s` }} d={`M-40 ${y}q55 -16 110 0t110 0t110 0t110 0t110 0`} />
              <circle className={`variant${i === 2 ? " ours" : ""}`} cx="200" cy={y} r={i === 2 ? 8 : 6} style={{ animationDelay: `${i * 0.25}s` }} />
            </g>
          ))}
        </svg>
      );
    case "incursion":
      return (
        <svg {...common}>
          <circle className="world a" cx="110" cy="150" r="62" />
          <circle className="world b" cx="290" cy="150" r="62" />
          <circle className="blast" cx="200" cy="150" r="20" />
        </svg>
      );
    case "tree":
      return (
        <svg {...common}>
          {fan(13, 26).map((dx, i) => (
            <path key={i} className="line grow" pathLength={1} style={{ animationDelay: `${Math.abs(i - 6) * 0.1}s` }}
              d={`M200 250C200 170 ${200 + dx * 0.6} 130 ${200 + dx} 30`} />
          ))}
          <circle className="keeper" cx="200" cy="250" r="10" />
        </svg>
      );
    case "kang":
      return (
        <svg {...common}>
          {Array.from({ length: 15 }, (_, i) => (
            <circle key={i} className="kang" cx={90 + (i % 5) * 55} cy={90 + Math.floor(i / 5) * 55} r="13" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
          <path className="strike" pathLength={1} d="M50 250L350 50" />
        </svg>
      );
    case "void":
      return (
        <svg {...common}>
          {[80, 150, 220].map((y, i) => (
            <g key={y}>
              <path className={`line${i === 1 ? " wither" : ""}`} d={`M30 ${y}H370`} />
              <circle className={i === 1 ? "anchor lost" : "anchor"} cx={110 + i * 80} cy={y} r="8" />
            </g>
          ))}
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            return (
              <circle key={i} className="member" r="10"
                style={{ ["--x" as string]: `${200 + Math.cos(a) * 70}px`, ["--y" as string]: `${170 + Math.sin(a) * 70}px`, ["--x0" as string]: `${40 + i * 64}px`, animationDelay: `${i * 0.1}s` }} />
            );
          })}
          <g className="ship"><path d="M-14 0L0 -22L14 0Z" /><text y="-4" textAnchor="middle">4</text></g>
        </svg>
      );
    case "four":
      return (
        <svg {...common}>
          <g className="family">
            {[[-34, -34], [34, -34], [-34, 34], [34, 34]].map(([x, y], i) => (
              <circle key={i} className="one" cx={200 + x} cy={150 + y} r="14" />
            ))}
          </g>
          <circle className="child" cx="200" cy="150" r="7" />
          <circle className="doom-ring" cx="200" cy="150" r="130" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          {fan(9, 34).map((dy, i) => (
            <path key={i} className="line grow" pathLength={1} style={{ animationDelay: `${Math.abs(i - 4) * 0.12}s` }}
              d={`M10 ${150 + dy}C150 ${150 + dy} 200 150 300 150`} />
          ))}
          <circle className="doom-orb" cx="300" cy="150" r="34" />
        </svg>
      );
  }
}

/** The left half of a card: the diagram, with the film's trailer one click away. */
function Stage({ kind, film, on }: { kind: string; film: string; on: boolean }) {
  const key = useTrailer(on ? film : null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { if (!on) setPlaying(false); }, [on]);
  return (
    <div className="card-viz">
      {playing && key ? (
        <iframe className="card-video" src={embedUrl(key)} title="Trailer" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <Visual kind={kind} />
      )}
      {playing ? (
        <button className="play" onClick={() => setPlaying(false)}>✕ Close trailer</button>
      ) : hasTrailers && key ? (
        <button className="play" onClick={() => { setPlaying(true); track("trailer_play", { title: film, from: "story" }); }}>▶ Play trailer</button>
      ) : !hasTrailers && film !== "doomsday" ? (
        <a className="play" href={searchUrl(film)} target="_blank" rel="noopener noreferrer">▶ Trailer on YouTube</a>
      ) : null}
    </div>
  );
}

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
          <p className="kicker">The story so far</p>
          <h2>How we got to Doomsday</h2>
        </div>
        <p className="story-warn">Spoilers for everything up to now.</p>
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
          <article key={c.kind} data-i={i} className={`card${i === active ? " on" : ""}`}>
            <Stage kind={c.kind} film={c.watch[c.watch.length - 1]} on={i === active} />
            <div className="card-text">
              <span className="card-n">{String(i + 1).padStart(2, "0")}<small> / {CHAPTERS.length}</small></span>
              <h3>{c.title}</h3>
              {c.body.map((p, k) => <p key={k}>{p}</p>)}
              <div className="card-watch">
                <span>See it in</span>
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
