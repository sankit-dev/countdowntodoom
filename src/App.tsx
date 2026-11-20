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

  const d = daysToDoom();
  const total = TITLES.length - 1;
  const seen = [...watched].filter((id) => BY_ID[id] && id !== DOOM_ID).length;

  return (
    <PosterProvider>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Road to Doomsday — home">
          <Sigil />
          <span className="brand-text">
            <small>Road to</small>
            <b>Doomsday</b>
          </span>
        </a>
        <nav>
          <a href="#story">Story</a>
          <a href="#timeline">Timeline</a>
          <a href="#planner">Planner</a>
          <a href="./countdown/">Countdown</a>
        </nav>
        <button className="nav-support" onClick={() => { setSupport(true); track("support_open", { from: "nav" }); }}>♥ Support</button>
        <span className="nav-count">
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
        <Story onSelect={select} />
        <TimelineMap
          selected={selected}
          focus={focus}
          onSelect={select}
          watched={watched}
          toggleWatched={toggleWatched}
          tier={tier}
          setTier={setTier}
        />
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
        <button className="btn" onClick={() => { setSupport(true); track("support_open", { from: "footer" }); }}>♥ Support this project</button>
        <p>
          An unofficial fan project. Not affiliated with, endorsed by or sponsored by Marvel or
          The Walt Disney Company. All film and series titles belong to their respective owners.
        </p>
        <p className="dim">Runtimes are approximate. Series runtimes cover the whole season. Poster images are loaded from Wikipedia and belong to their respective rights holders.</p>
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
