import { useEffect, useRef, useState } from "react";
import { DOOM_DATE, LANES, TITLES } from "../data";

function useCountdown() {
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

/** Embers drifting upward. Pauses when the hero is off screen. */
function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0, h = 0, raf = 0, visible = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const N = Math.min(110, Math.round(w / 12));
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: 0.5 + Math.random() * 1.8, v: 0.15 + Math.random() * 0.55,
      a: Math.random() * Math.PI * 2, gold: Math.random() < 0.3,
    }));
    const tick = () => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        for (const p of ps) {
          p.y -= p.v; p.a += 0.012; p.x += Math.sin(p.a) * 0.25;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          const tw = 0.35 + 0.35 * Math.sin(p.a * 3);
          ctx.fillStyle = p.gold ? `rgba(216,181,106,${tw})` : `rgba(141,255,106,${tw})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="embers" aria-hidden="true" />;
}

/** Fourteen timelines, seven from each side, bending into one point. */
function Strands() {
  const ys = [40, 170, 300, 430, 560, 690, 830];
  return (
    <svg className="strands" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="orb" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#8dff6a" stopOpacity=".55" />
          <stop offset=".35" stopColor="#8dff6a" stopOpacity=".14" />
          <stop offset="1" stopColor="#8dff6a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {LANES.map((l, i) => (
        <g key={l.id} stroke={l.color} fill="none">
          <path className="strand" style={{ animationDelay: `${-i * 0.9}s` }}
            d={`M-40 ${ys[i]} C 380 ${ys[i]}, 520 430, 800 430`} />
          <path className="strand" style={{ animationDelay: `${-i * 0.9 - 2}s` }}
            d={`M1640 ${ys[6 - i]} C 1220 ${ys[6 - i]}, 1080 430, 800 430`} />
        </g>
      ))}
      <circle cx="800" cy="430" r="420" fill="url(#orb)" />
      <g className="rings" fill="none" stroke="#8dff6a">
        <circle cx="800" cy="430" r="150" strokeOpacity=".35" strokeDasharray="2 14" />
        <circle cx="800" cy="430" r="215" strokeOpacity=".2" strokeDasharray="40 22" />
        <circle cx="800" cy="430" r="290" strokeOpacity=".12" strokeDasharray="4 30" />
      </g>
    </svg>
  );
}

export function Hero() {
  const c = useCountdown();
  const count = TITLES.length - 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <section className="hero">
      <Strands />
      <Embers />
      <div className="hero-vignette" />
      <div className="hero-body">
        <p className="kicker">{count} stories · 18 years · one collision course</p>
        <h1 className="wordmark">
          <span className="wm-top">Road to</span>
          <span className="wm-main" data-text="Doomsday">Doomsday</span>
        </h1>
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
      <a className="scroll-cue" href="#timeline" aria-label="Scroll to the timeline"><i /></a>
    </section>
  );
}
