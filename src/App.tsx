import { useCallback, useEffect, useState } from "react";
import { track } from "./analytics";
import { BY_ID, DOOM_DATE, DOOM_ID, TITLES } from "./data";
import { Hero } from "./components/Hero";
import { TimelineMap } from "./components/TimelineMap";
import { Drawer } from "./components/Drawer";
import { Planner } from "./components/Planner";
import { Story } from "./components/Story";
import { Support } from "./components/Support";
import { Sigil } from "./components/Sigil";
import { PosterProvider } from "./posters";

export type Tier = "all" | "recommended" | "essential";

const STORE = "rtd.watched.v1";
const loadWatched = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE) || "[]"));
  } catch {
    return new Set();
  }
};

export const daysToDoom = () =>
  Math.ceil((DOOM_DATE.getTime() - Date.now()) / 86_400_000);

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null);
  const [watched, setWatched] = useState<Set<string>>(loadWatched);
  const [tier, setTier] = useState<Tier>("essential");
  const [support, setSupport] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify([...watched]));
    } catch {
      /* private mode – the site still works, it just won't remember */
    }
  }, [watched]);

  const toggleWatched = useCallback((id: string) => {
    setWatched((w) => {
      const n = new Set(w);
      if (n.has(id)) n.delete(id);
      else { n.add(id); track("mark_watched", { title: id }); }
      return n;
    });
  }, []);

  /** Select a title; `travel` also flies the map to it. */
  const select = useCallback((id: string | null, travel = false) => {
    setSelected(id);
    if (id && travel) setFocus((f) => ({ id, n: (f?.n || 0) + 1 }));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Whole days, rounded down like the big countdown, so the two always agree.
  const d = Math.max(0, Math.floor((DOOM_DATE.getTime() - Date.now()) / 86_400_000));
  // The nav's "days left" only shows once the big countdown has scrolled out of view.
  const [pastCountdown, setPastCountdown] = useState(false);
  useEffect(() => {
    const el = document.querySelector(".hero .count, .hero .count-over");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPastCountdown(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const total = TITLES.length - 1;
  const seen = [...watched].filter((id) => BY_ID[id] && id !== DOOM_ID).length;

  return (
    <PosterProvider>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Road to Doomsday, home">
          <Sigil />
          <span className="brand-text">
            <small>Road to</small>
            <b>Doomsday</b>
          </span>
        </a>
        <nav>
          <a href="#timeline">Watch order</a>
          <a href="#story">Catch up</a>
          <a href="#planner">Watch plan</a>
          <a href="./countdown/">Countdown</a>
        </nav>
        <button className="nav-support" onClick={() => { setSupport(true); track("support_open", { from: "nav" }); }}>Support</button>
        <span className={`nav-count${pastCountdown ? " on" : ""}`} aria-hidden={!pastCountdown}>
          {d > 0 ? (
            <>
              <b>{d}</b> {d === 1 ? "day" : "days"} left
            </>
          ) : (
            <b>Doomsday is here</b>
          )}
        </span>
      </header>

      <div className="nav-progress" role="progressbar" aria-label="Titles watched" aria-valuemin={0} aria-valuemax={total} aria-valuenow={seen}>
        <i style={{ transform: `scaleX(${seen / total})` }} />
      </div>

      <main id="top">
        <Hero />
        <TimelineMap
          selected={selected}
          focus={focus}
          onSelect={select}
          watched={watched}
          toggleWatched={toggleWatched}
          tier={tier}
          setTier={setTier}
        />
        <Story onSelect={select} />
        <Planner watched={watched} onSelect={select} />
      </main>

      <footer className="foot">
        <Sigil />
        <nav className="foot-links" aria-label="Guides">
          <a href="./watch-order/">Full watch order</a>
          <a href="./essentials/">The essentials</a>
          <a href="./story/">The story so far</a>
          <a href="./countdown/">Countdown</a>
        </nav>
        <button className="btn" onClick={() => { setSupport(true); track("support_open", { from: "footer" }); }}>Support this site</button>
        <p>
          Just a fan project. It's not affiliated with or endorsed by Marvel or Disney, and all the
          titles belong to them.
        </p>
        <p className="dim">Runtimes are rough, and for shows it's the whole season. Posters come from Wikipedia and belong to their owners.</p>
      </footer>

      <Drawer
        id={selected}
        watched={watched}
        toggleWatched={toggleWatched}
        onSelect={select}
        onClose={() => setSelected(null)}
      />
      <Support open={support} onClose={() => setSupport(false)} />
    </PosterProvider>
  );
}
