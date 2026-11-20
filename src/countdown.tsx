import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useCountdown } from "./components/Hero";
import "./styles.css";

// The /countdown page: the clock and nothing else.
//
// Background: public/doom-throne.jpg if that file exists. Otherwise the lead
// image of the film's Wikipedia article is loaded in the visitor's browser.
const LOCAL = "../doom-throne.jpg";
const WIKI =
  "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1" +
  "&prop=pageimages&piprop=thumbnail&pithumbsize=1600&pilicense=any&titles=" +
  encodeURIComponent("Avengers: Doomsday");

const loads = (src: string) =>
  new Promise<string>((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(src);
    img.onerror = fail;
    img.src = src;
  });

function useBackdrop() {
  const [bg, setBg] = useState<{ src: string; own: boolean } | null>(null);
  useEffect(() => {
    let live = true;
    loads(LOCAL)
      .then((src) => live && setBg({ src, own: true }))
      .catch(async () => {
        const q = (await (await fetch(WIKI)).json()).query;
        const page: any = Object.values(q?.pages || {})[0];
        const src = page?.thumbnail?.source;
        if (src) { await loads(src); if (live) setBg({ src, own: false }); }
      })
      .catch(() => { /* stays black */ });
    return () => { live = false; };
  }, []);
  return bg;
}

function Countdown() {
  const c = useCountdown();
  const bg = useBackdrop();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <main className="cd">
      {bg && <div className={`cd-bg${bg.own ? "" : " cd-blur"}`} style={{ backgroundImage: `url("${bg.src}")` }} aria-hidden="true" />}
      {/* A poster is tall and the screen is wide: show it whole over a blurred copy of itself. */}
      {bg && !bg.own && <img className="cd-poster" src={bg.src} alt="" />}
      <div className="cd-shade" aria-hidden="true" />
      <div className="cd-body">
        <p className="cd-kicker">Avengers: Doomsday</p>
        {c.over ? (
          <p className="cd-over">Doomsday is here</p>
        ) : (
          <div className="cd-clock" role="timer" aria-label={`${c.d} days until Avengers: Doomsday`}>
            {([["Days", c.d], ["Hours", c.h], ["Minutes", c.m], ["Seconds", c.s]] as const).map(([l, v]) => (
              <div key={l}>
                <b>{pad(v)}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
        )}
        <p className="cd-date">18 December 2026</p>
      </div>
      <a className="cd-back" href="../">Road to Doomsday →</a>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Countdown />);
