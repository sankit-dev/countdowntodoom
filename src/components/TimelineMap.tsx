import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BY_ID, DOOM_ID, LANES, LANE_BY_ID, PHASES, TITLES, bloodline, fmtMin, tierOf,
} from "../data";
import type { Tier } from "../App";

const STEP = 158; // horizontal distance between consecutive releases
const PLATE_W = 142;
const PHASE_GAP = 70;
const PAD_L = 250;
const DOOM_R = 96;
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];

interface Props {
  selected: string | null;
  focus: { id: string; n: number } | null;
  onSelect: (id: string | null, travel?: boolean) => void;
  watched: Set<string>;
  tier: Tier;
  setTier: (t: Tier) => void;
}

function useViewport() {
  const [v, setV] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return v;
}

export function TimelineMap({ selected, focus, onSelect, watched, tier, setTier }: Props) {
  const vp = useViewport();
  const [hover, setHover] = useState<string | null>(null);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const yearEl = useRef<HTMLDivElement>(null);
  const phaseEl = useRef<HTMLSpanElement>(null);
  const dragged = useRef(false);

  // ── Layout ───────────────────────────────────────────────────────────────
  const L = useMemo(() => {
    const compact = vp.w < 720;
    const top = compact ? 218 : 190;
    const bottom = 78;
    const laneH = Math.max(56, Math.min(106, (vp.h - top - bottom) / LANES.length));
    const laneY = (i: number) => top + i * laneH + laneH / 2;
    const laneIndex = Object.fromEntries(LANES.map((l, i) => [l.id, i]));

    const pos: Record<string, { x: number; y: number }> = {};
    const bands: { phase: number; x0: number; x1: number }[] = [];
    let x = compact ? 190 : PAD_L + 20;
    let cur = 0;
    for (const t of TITLES) {
      if (t.id === DOOM_ID) continue;
      if (t.phase && t.phase !== cur) {
        if (cur) x += PHASE_GAP;
        cur = t.phase;
        bands.push({ phase: cur, x0: x - STEP / 2, x1: x });
      }
      pos[t.id] = { x, y: laneY(laneIndex[t.lane]) };
      bands[bands.length - 1].x1 = x + STEP / 2;
      x += STEP;
    }
    const doomX = x + 250;
    pos[DOOM_ID] = { x: doomX, y: top + (laneH * LANES.length) / 2 };
    const width = doomX + Math.max(260, vp.w / 2);

    const edges = TITLES.flatMap((a) =>
      a.to.map((bid) => {
        const p = pos[a.id], q = pos[bid];
        const sx = p.x + PLATE_W / 2, ex = q.x - (bid === DOOM_ID ? DOOM_R : PLATE_W / 2);
        const c = Math.max(50, (ex - sx) * 0.45);
        // Same-lane links that skip over other plates dip below the lane.
        const dip = p.y === q.y && ex - sx > STEP ? laneH * 0.52 : 0;
        return {
          key: `${a.id}>${bid}`, from: a.id, to: bid, color: LANE_BY_ID[a.lane].color,
          d: `M${sx} ${p.y} C${sx + c} ${p.y + dip}, ${ex - c} ${q.y + dip}, ${ex} ${q.y}`,
        };
      })
    );
    return { top, laneH, laneY, pos, bands, width, edges, height: vp.h };
  }, [vp.w, vp.h]);

  const travel = Math.max(0, L.width - vp.w);

  // ── Scroll → horizontal travel ───────────────────────────────────────────
  const order = useMemo(
    () => TITLES.map((t) => ({ t, x: L.pos[t.id].x })).sort((a, b) => a.x - b.x),
    [L]
  );
  useLayoutEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const p = travel ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel)) : 0;
      const x = p * travel;
      track.current!.style.transform = `translate3d(${-x}px,0,0)`;
      fill.current!.style.transform = `scaleX(${p})`;
      const centre = x + vp.w / 2;
      let near = order[0];
      for (const o of order) if (Math.abs(o.x - centre) < Math.abs(near.x - centre)) near = o;
      yearEl.current!.textContent = String(near.t.year);
      const ph = near.t.phase ? PHASES[near.t.phase] : null;
      phaseEl.current!.textContent =
        near.t.id === DOOM_ID ? "The end of the road" : ph ? `${ph.name} — ${ph.saga}` : "Another universe";
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, [travel, vp.w, order]);

  const flyTo = (x: number, smooth = true) => {
    const el = section.current!;
    const topAbs = el.getBoundingClientRect().top + window.scrollY;
    const target = topAbs + Math.min(travel, Math.max(0, x - vp.w / 2));
    window.scrollTo({ top: target, behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if (focus && L.pos[focus.id]) flyTo(L.pos[focus.id].x);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  // ── Mouse drag to pan ────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const sx = e.clientX, sy = window.scrollY;
    dragged.current = false;
    const move = (m: PointerEvent) => {
      const dx = m.clientX - sx;
      if (!dragged.current && Math.abs(dx) < 6) return;
      dragged.current = true;
      document.body.classList.add("dragging");
      window.scrollTo(0, sy - dx);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.classList.remove("dragging");
      setTimeout(() => (dragged.current = false), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // ── Highlighting ─────────────────────────────────────────────────────────
  const active = hover ?? selected;
  const lit = useMemo(() => (active ? bloodline(active) : null), [active]);
  const passesTier = (id: string) => {
    if (tier === "all" || id === DOOM_ID) return true;
    const t = tierOf(BY_ID[id]);
    return tier === "essential" ? t === "essential" : t !== "deep";
  };

  // Jump targets: each phase lands with its first title near the left edge.
  const marks = L.bands.map((b) => ({
    label: ROMAN[b.phase], title: PHASES[b.phase].name, x: b.x0 + STEP / 2 + vp.w / 2 - 120,
  }));

  return (
    <section
      id="timeline"
      className="map-section"
      ref={section}
      style={{ height: travel + vp.h }}
    >
      <div className="map-stage" onPointerDown={onPointerDown}>
        <div className="map-year" ref={yearEl} aria-hidden="true">2008</div>

        <div className="map-head">
          <div>
            <h2>Every road leads to Doom</h2>
            <p><span ref={phaseEl}>Phase One — The Infinity Saga</span></p>
          </div>
          <div className="seg" role="group" aria-label="Filter by importance">
            {(["all", "recommended", "essential"] as Tier[]).map((t) => (
              <button key={t} className={tier === t ? "on" : ""} onClick={() => setTier(t)}>
                {t === "all" ? "Everything" : t === "recommended" ? "Recommended" : "Essentials"}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`map-track${lit ? " has-lit" : ""}`}
          ref={track}
          style={{ width: L.width, height: L.height }}
          onClickCapture={(e) => { if (dragged.current) { e.stopPropagation(); e.preventDefault(); } }}
          onClick={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
        >
          {L.bands.map((b) => (
            <div key={b.phase} className="band" style={{ left: b.x0, width: b.x1 - b.x0, top: L.top - 58, height: L.laneH * LANES.length + 70 }}>
              <b>{PHASES[b.phase].name}</b>
              <span>{PHASES[b.phase].saga}</span>
            </div>
          ))}

          {LANES.map((l, i) => (
            <i key={l.id} className="lane-line" style={{ top: L.laneY(i), color: l.color }} />
          ))}

          <svg className="edges" width={L.width} height={L.height} aria-hidden="true">
            {L.edges.map((e) => {
              const on = lit ? lit.has(e.from) && lit.has(e.to) : false;
              const faded = !passesTier(e.from) || !passesTier(e.to);
              return (
                <path
                  key={e.key}
                  d={e.d}
                  stroke={e.color}
                  className={`edge${on ? " on" : ""}${faded ? " faded" : ""}${e.to === DOOM_ID ? " to-doom" : ""}`}
                />
              );
            })}
          </svg>

          {TITLES.map((t) => {
            const p = L.pos[t.id];
            const cls = [
              lit?.has(t.id) ? "lit" : "",
              selected === t.id ? "sel" : "",
              watched.has(t.id) ? "seen" : "",
              passesTier(t.id) ? "" : "faded",
            ].join(" ");
            const handlers = {
              onMouseEnter: () => setHover(t.id),
              onMouseLeave: () => setHover(null),
              onFocus: () => { if (!dragged.current && document.activeElement?.matches(":focus-visible")) flyTo(p.x, false); },
              onClick: () => onSelect(selected === t.id ? null : t.id),
            };
            if (t.id === DOOM_ID)
              return (
                <button key={t.id} className={`doom ${cls}`} style={{ left: p.x, top: p.y }} {...handlers}>
                  <i /><i /><i />
                  <small>Avengers</small>
                  <b>Doomsday</b>
                  <span>18 · 12 · 2026</span>
                </button>
              );
            return (
              <button
                key={t.id}
                className={`plate tier-${tierOf(t)} ${cls}`}
                style={{ left: p.x, top: p.y, ["--c" as string]: LANE_BY_ID[t.lane].color }}
                aria-label={`${t.title}, ${t.year}`}
                {...handlers}
              >
                <b>{t.title}</b>
                <span>
                  {t.year} · {fmtMin(t.min)}
                  {t.kind !== "film" && <em>{t.kind === "series" ? "Series" : "Special"}</em>}
                </span>
                {watched.has(t.id) && <u aria-label="Watched">✓</u>}
              </button>
            );
          })}
        </div>

        <div className="lane-labels" aria-hidden="true">
          {LANES.map((l, i) => (
            <span key={l.id} style={{ top: L.laneY(i), color: l.color }}>{l.name}</span>
          ))}
        </div>

        <div className="map-foot">
          <span className="hint">Scroll or drag to travel · click a title to trace its path</span>
          <div className="rail">
            <div className="rail-fill" ref={fill} />
            {marks.map((m) => (
              <button
                key={m.label}
                title={m.title}
                style={{ left: `${travel ? Math.min(100, Math.max(0, ((m.x - vp.w / 2) / travel) * 100)) : 0}%` }}
                onClick={() => flyTo(m.x)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button className="rail-doom" onClick={() => flyTo(L.pos[DOOM_ID].x)}>Doom</button>
        </div>
      </div>
    </section>
  );
}
