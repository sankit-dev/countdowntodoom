import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BY_ID, DOOM_ID, LANES, LANE_BY_ID, PHASES, TITLES, bloodline, tierOf,
} from "../data";
import type { Tier } from "../App";

const STEP = 126; // horizontal distance between consecutive releases
const TILE_W = 84;
const TILE_H = 44;
const PHASE_GAP = 80;
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

type Pt = [number, number];
/** A right-angled connector through `pts`, with softened corners. */
function elbow(raw: Pt[], r = 7) {
  const pts = raw.filter((p, i) => !i || p[0] !== raw[i - 1][0] || p[1] !== raw[i - 1][1]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(cx - px, cy - py), d2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    if (rr < 0.5) { d += `L${cx} ${cy}`; continue; }
    d += `L${cx - ((cx - px) / d1) * rr} ${cy - ((cy - py) / d1) * rr}Q${cx} ${cy} ${cx + ((nx - cx) / d2) * rr} ${cy + ((ny - cy) / d2) * rr}`;
  }
  const last = pts[pts.length - 1];
  return d + `L${last[0]} ${last[1]}`;
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
  // Every title gets its own column (release order) and sits in its
  // storyline's row. Connectors leave a tile to the right, travel along the
  // empty channel between two rows, and drop into the target from the left —
  // so a line never runs across a tile.
  const L = useMemo(() => {
    const compact = vp.w < 720;
    const top = compact ? 226 : 198;
    const bottom = 72;
    const laneH = Math.max(80, Math.min(118, (vp.h - top - bottom) / LANES.length));
    const laneTop = (i: number) => top + i * laneH;
    const tileY = (i: number) => laneTop(i) + 2 + TILE_H / 2;
    const channel = (i: number) => laneTop(i) + laneH - 9; // gap under row i
    const laneIndex = Object.fromEntries(LANES.map((l, i) => [l.id, i])) as Record<string, number>;

    const pos: Record<string, { x: number; y: number }> = {};
    const bands: { phase: number; x0: number; x1: number }[] = [];
    let x = compact ? 170 : 262;
    let cur = 0;
    for (const t of TITLES) {
      if (t.id === DOOM_ID) continue;
      if (t.phase && t.phase !== cur) {
        if (cur) x += PHASE_GAP;
        cur = t.phase;
        bands.push({ phase: cur, x0: x - STEP / 2, x1: x });
      }
      pos[t.id] = { x, y: tileY(laneIndex[t.lane]) };
      bands[bands.length - 1].x1 = x + STEP / 2;
      x += STEP;
    }
    const doomX = x + 250;
    const doomY = top + (laneH * LANES.length) / 2;
    pos[DOOM_ID] = { x: doomX, y: doomY };
    const width = doomX + Math.max(260, vp.w / 2);

    const order = TITLES.map((t) => t.id);
    const nextInLane = (a: string) => {
      const lane = BY_ID[a].lane;
      for (let i = order.indexOf(a) + 1; i < order.length; i++)
        if (BY_ID[order[i]].lane === lane && order[i] !== DOOM_ID) return order[i];
      return null;
    };

    const edges = TITLES.flatMap((a) =>
      a.to.map((bid) => {
        const p = pos[a.id];
        const li = laneIndex[a.lane];
        const sx = p.x + TILE_W / 2, sy = p.y;
        const x1 = sx + 10;
        let pts: Pt[];
        if (bid === DOOM_ID) {
          // Fan into the left side of the circle, one entry point per row.
          const ey = doomY + (li - 3) * 18;
          const ex = doomX - Math.sqrt(DOOM_R * DOOM_R - (ey - doomY) ** 2);
          const x2 = doomX - DOOM_R - 34 - Math.abs(li - 3) * 10;
          const cy = channel(ey > sy ? li : li - 1) + (li % 2 ? 3 : -3);
          pts = [[sx, sy], [x1, sy], [x1, cy], [x2, cy], [x2, ey], [ex, ey]];
        } else {
          const q = pos[bid];
          const ti = laneIndex[BY_ID[bid].lane];
          const ex = q.x - TILE_W / 2, ey = q.y;
          const x2 = ex - 12;
          if (ti === li && nextInLane(a.id) === bid) pts = [[sx, sy], [ex, ey]];
          else {
            const off = ((order.indexOf(bid) % 4) - 1.5) * 4; // same target → same trunk
            const cy = channel(ti < li ? li - 1 : li) + off;
            pts = [[sx, sy], [x1, sy], [x1, cy], [x2, cy], [x2, ey], [ex, ey]];
          }
        }
        return { key: `${a.id}>${bid}`, from: a.id, to: bid, color: LANE_BY_ID[a.lane].color, d: elbow(pts) };
      })
    );
    return { top, laneH, laneTop, tileY, pos, bands, width, edges, height: vp.h };
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
    label: ROMAN[b.phase], title: PHASES[b.phase].name, x: b.x0 + STEP / 2 + vp.w / 2 - 140,
  }));

  return (
    <section id="timeline" className="map-section" ref={section} style={{ height: travel + vp.h }}>
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
            <div key={b.phase} className="band" style={{ left: b.x0, width: b.x1 - b.x0, top: L.top - 50, height: L.laneH * LANES.length + 50 }}>
              <b>{PHASES[b.phase].name}</b>
              <span>{PHASES[b.phase].saga}</span>
            </div>
          ))}

          <svg className="edges" width={L.width} height={L.height} aria-hidden="true">
            {L.edges.map((e) => {
              const on = lit ? lit.has(e.from) && lit.has(e.to) : false;
              const faded = !passesTier(e.from) || !passesTier(e.to);
              return (
                <path key={e.key} d={e.d} style={{ color: e.color }}
                  className={`edge${on ? " on" : ""}${faded ? " faded" : ""}`} />
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
                className={`tile tier-${tierOf(t)} ${cls}`}
                style={{ left: p.x, top: p.y - TILE_H / 2, ["--c" as string]: LANE_BY_ID[t.lane].color }}
                aria-label={`${t.title}, ${t.year}`}
                {...handlers}
              >
                <span className="art" style={t.poster ? { backgroundImage: `url(${t.poster})` } : undefined}>
                  {!t.poster && t.year}
                  {t.kind !== "film" && <em>{t.kind === "series" ? "TV" : "SP"}</em>}
                  {watched.has(t.id) && <u aria-label="Watched">✓</u>}
                </span>
                <b>{t.title}</b>
              </button>
            );
          })}
        </div>

        <div className="lane-labels" aria-hidden="true">
          {LANES.map((l, i) => (
            <span key={l.id} style={{ top: L.tileY(i), color: l.color }}>{l.name}</span>
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
