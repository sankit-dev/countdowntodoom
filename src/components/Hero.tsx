import { useEffect, useState } from "react";
import { DOOM_DATE, TITLES } from "../data";
import { useBackdrop } from "../backdrop";

// The opening is the hero itself: the background image comes up out of black
// with a slow push-in, the wordmark arrives letter by letter, then the rest.
// Background: public/hero.jpg if present, otherwise the film's image from Wikipedia.
const HERO_IMAGE = `${import.meta.env.BASE_URL}hero.jpg`;

export function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const ms = Math.max(0, DOOM_DATE.getTime() - now);
  return {
    over: ms === 0,
    d: Math.floor(ms / 86_400_000),
    h: Math.floor(ms / 3_600_000) % 24,
    m: Math.floor(ms / 60_000) % 60,
    s: Math.floor(ms / 1000) % 60,
  };
}

export function Hero() {
  const c = useCountdown();
  const count = TITLES.length - 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  const bg = useBackdrop(HERO_IMAGE);
  // The green glow behind the wordmark follows the pointer.
  const glow = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <section className="hero" onPointerMove={glow}>
      {bg && <div className={`hero-bg${bg.own ? "" : " hero-blur"}`} style={{ backgroundImage: `url("${bg.src}")` }} aria-hidden="true" />}
      {bg && !bg.own && <img className="hero-poster" src={bg.src} alt="" />}
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-vignette" />
      <div className="hero-body">
        <h1 className="wordmark" aria-label="Road to Doomsday">
          <span className="wm-top" aria-hidden="true">Road to</span>
          <span className="wm-main" aria-hidden="true">
            {"Doomsday".split("").map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.7 + i * 0.09}s` }}>{ch}</span>
            ))}
          </span>
        </h1>

        <div className="hero-rest">
          <p className="kicker">{count} stories · 18 years · one collision course</p>
          <p className="lede">
            Every film and series that leads to <em>Avengers: Doomsday</em>, mapped as one connected
            timeline — and a watch plan built around the time you actually have.
          </p>

          {c.over ? (
            <p className="count-over">In cinemas now</p>
          ) : (
            <div className="count" role="timer" aria-label={`${c.d} days until release`}>
              {([["Days", c.d], ["Hours", c.h], ["Minutes", c.m], ["Seconds", c.s]] as const).map(([l, v]) => (
                <div key={l} className="count-cell">
                  <b>{pad(v)}</b>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          )}

          <div className="cta">
            <a className="btn btn-primary" href="#timeline">Enter the timeline</a>
            <a className="btn" href="#planner">Plan my marathon</a>
          </div>
        </div>
      </div>
      <a className="scroll-cue" href="#timeline" aria-label="Scroll to the timeline"><i /></a>
    </section>
  );
}
