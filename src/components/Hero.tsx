import { useEffect, useState } from "react";
import { RegionNote, releaseAt, useRegion } from "../release";
import { isPhone, useBackdrop } from "../backdrop";
import { LoopVideo } from "./LoopVideo";

// The opening is the hero itself: the background image comes up out of black
// with a slow push-in, the wordmark arrives letter by letter, then the rest.
// Background: public/hero.jpg if present, otherwise the film's image from Wikipedia.
const BASE = import.meta.env.BASE_URL;

export function useCountdown() {
  const [region] = useRegion();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const ms = Math.max(0, releaseAt(region) - now);
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
  const pad = (n: number) => String(n).padStart(2, "0");
  const bg = useBackdrop(isPhone() ? `${BASE}phone-tapestry.jpg` : `${BASE}hero.jpg`);
    return (
    <section className="hero">
      {bg && <div className={`hero-bg${bg.own ? "" : " hero-blur"}${isPhone() ? " phone" : ""}`} style={{ backgroundImage: `url("${bg.src}")` }} aria-hidden="true" />}
      {bg && !bg.own && <img className="hero-poster" src={bg.src} alt="" />}
      <LoopVideo base={import.meta.env.BASE_URL} className="hero-video" />
      <div className="hero-vignette" />
      <a className="scroll-cue" href="#timeline" aria-label="Scroll to the watch order"><span>Scroll</span><i /></a>
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
          <p className="lede">Every MCU movie and show you need before Doomsday, in order.</p>

          {c.over ? (
            <p className="count-over">In cinemas now</p>
          ) : (
            <>
              {/* Laptops: the full four-box countdown. */}
              <div className="count" role="timer" aria-label={`${c.d} days until release`}>
                {([["Days", c.d], ["Hours", c.h], ["Minutes", c.m], ["Seconds", c.s]] as const).map(([l, v]) => (
                  <div key={l} className="count-cell">
                    <b>{pad(v)}</b>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
              {/* Phones: one big number, the rest small underneath. */}
              <div className="count-mini" role="timer" aria-label={`${c.d} days until release`}>
                <b>{c.d}</b>
                <span>{c.d === 1 ? "day" : "days"} to go</span>
                <small>{pad(c.h)}h {pad(c.m)}m {pad(c.s)}s</small>
              </div>
            </>
          )}
          <RegionNote />

          <div className="cta">
            <a className="btn btn-primary" href="#timeline">See the watch order</a>
            <a className="btn cta-alt" href="#planner">Make me a watch plan</a>
          </div>
        </div>
      </div>
    </section>
  );
}
