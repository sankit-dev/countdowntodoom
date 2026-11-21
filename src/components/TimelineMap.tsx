import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { track } from "../analytics";
import { BY_ID, DOOM_ID, TITLES, Title, fmtMin, parentsOf } from "../data";
import type { Tier } from "../App";
import { Poster, usePosters } from "../posters";
import { doomReady } from "../doomReady";
import { RELEASE, useRegion } from "../release";

const ShareCard = lazy(() => import("./ShareCard"));

interface Props {
  selected: string | null;
  focus: { id: string; n: number } | null;
  onSelect: (id: string | null, travel?: boolean) => void;
  watched: Set<string>;
  toggleWatched: (id: string) => void;
  tier: Tier;
  setTier: (t: Tier) => void;
}

const MIN_IMP: Record<Tier, number> = { essential: 7, recommended: 4, all: 0 };
const VIEWS: { tier: Tier; label: string }[] = [
  { tier: "essential", label: "Essentials" },
  { tier: "recommended", label: "Recommended" },
  { tier: "all", label: "Everything" },
];
const tierFor = (t: Title): Tier => (t.imp >= 7 ? "essential" : t.imp >= 4 ? "recommended" : "all");

const LEAF_W = 136, PW = 96, PH = 144, LABEL = 34;
const ROW_H = PH + LABEL + 50;
const SIDE = 46; // room at each edge for the road to turn around
const DOOM_R = 70;

function useStageWidth(ref: React.RefObject<HTMLDivElement>) {
  const [w, setW] = useState(1200);
  useLayoutEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

type Pt = [number, number];
/** A path through `pts` with rounded corners. */
function rounded(pts: Pt[], r: number) {
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

export function TimelineMap({ selected, focus, onSelect, watched, toggleWatched, tier, setTier }: Props) {
  const [region] = useRegion();
  const [sharing, setSharing] = useState(false);
  const posters = usePosters();
  const stage = useRef<HTMLDivElement>(null);
  const stageW = useStageWidth(stage);
  const [hover, setHover] = useState<string | null>(null);
  const [card, setCard] = useState<{ id: string; x: number; y: number; flip: boolean } | null>(null);
  const enter = (id: string, el: HTMLElement) => {
    setHover(id);
    const r = el.getBoundingClientRect();
    const flip = r.right + 300 > window.innerWidth;
    setCard({ id, x: flip ? r.left - 12 : r.right + 12, y: Math.max(70, Math.min(window.innerHeight - 190, r.top)), flip });
  };
  const leave = () => { setHover(null); setCard(null); };
  useEffect(() => {
    window.addEventListener("scroll", leave, { passive: true });
    return () => window.removeEventListener("scroll", leave);
  }, []);

  // ── The road ─────────────────────────────────────────────────────────────
  // One line, in watch order: 1 → 2 → 3 … → Doomsday. It runs left to right,
  // turns at the edge, and comes back on the next row.
  const G = useMemo(() => {
    const list = TITLES.filter((t) => t.id !== DOOM_ID && t.imp >= MIN_IMP[tier]);
    const stops = [...list.map((t) => t.id), DOOM_ID];
    const cols = Math.max(3, Math.min(9, Math.floor((stageW - 56 - SIDE * 2) / LEAF_W)));
    const cell = (i: number) => {
      const r = Math.floor(i / cols), c = i % cols;
      return { r, c: r % 2 ? cols - 1 - c : c };
    };
    const cx = (i: number) => SIDE + cell(i).c * LEAF_W + LEAF_W / 2;
    const cy = (i: number) => cell(i).r * ROW_H + PH / 2 + 10; // middle of the poster
    const rows = cell(stops.length - 1).r + 1;
    const width = SIDE * 2 + cols * LEAF_W;
    const height = rows * ROW_H;

    // The line through every stop, looping round the edge between rows.
    const pts: Pt[] = [];
    const arrows: { x: number; y: number; a: number }[] = [];
    for (let i = 0; i < stops.length; i++) {
      pts.push([cx(i), cy(i)]);
      if (i === stops.length - 1) break;
      if (cell(i + 1).r === cell(i).r) {
        arrows.push({ x: (cx(i) + cx(i + 1)) / 2, y: cy(i), a: cell(i).r % 2 ? 180 : 0 });
      } else {
        const edge = cell(i).r % 2 ? 12 : width - 12;
        pts.push([edge, cy(i)], [edge, cy(i + 1)]);
        arrows.push({ x: edge, y: (cy(i) + cy(i + 1)) / 2, a: 90 });
      }
    }
    const index = Object.fromEntries(stops.map((id, i) => [id, i]));
    return { list, stops, index, cx, cy, width, height, d: rounded(pts, 26), arrows };
  }, [tier, stageW]);

  // ── Hover: what this title connects to in the story ──────────────────────
  const active = hover ?? selected;
  const links = useMemo(() => {
    if (!active || !(active in G.index)) return null;
    const out = BY_ID[active].to.filter((n) => n in G.index);
    const into = parentsOf(active).filter((n) => n in G.index);
    return { set: new Set([active, ...out, ...into]), pairs: [...out.map((n) => [active, n]), ...into.map((n) => [n, active])] };
  }, [active, G]);

  // ── Pan and zoom ─────────────────────────────────────────────────────────
  // The tree sits on a canvas: drag to move it, pinch / Ctrl+scroll / the
  // buttons to zoom. Plain scrolling is left alone so the page still scrolls.
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const dragged = useRef(false);
  const MIN_K = 0.2, MAX_K = 2.2;
  const PAD = 28;

  const fit = (whole: boolean) => {
    const el = stage.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const byW = (w - PAD * 2) / G.width, byH = (h - PAD * 2) / G.height;
    const k = Math.max(MIN_K, Math.min(1, whole ? Math.min(byW, byH) : byW));
    // Centred, starting from the top (number 1) unless showing it all.
    setView({ k, x: (w - G.width * k) / 2, y: whole ? Math.max(PAD, (h - G.height * k) / 2) : PAD });
  };
  useLayoutEffect(() => fit(false), [G]); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomAt = (cx: number, cy: number, factor: number) =>
    setView((v) => {
      const k = Math.max(MIN_K, Math.min(MAX_K, v.k * factor));
      return { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k };
    });
  const zoomBy = (factor: number) => {
    const el = stage.current!;
    zoomAt(el.clientWidth / 2, el.clientHeight / 2, factor);
  };

  // Ctrl/⌘ + wheel (which is also what a trackpad pinch sends) zooms.
  useEffect(() => {
    const el = stage.current!;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      // A mouse wheel sends big steps, a trackpad pinch small ones; cap the big ones.
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-Math.max(-30, Math.min(30, e.deltaY)) * 0.01));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // One pointer drags; two pointers pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ x: number; y: number; d: number } | null>(null);
  const measure = () => {
    const ps = [...pointers.current.values()];
    const x = ps.reduce((n, p) => n + p.x, 0) / ps.length, y = ps.reduce((n, p) => n + p.y, 0) / ps.length;
    return { x, y, d: ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0 };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current = measure();
    if (pointers.current.size === 1) dragged.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g0 = gesture.current, g1 = measure();
    const dx = g1.x - g0.x, dy = g1.y - g0.y;
    if (!dragged.current && pointers.current.size === 1 && Math.hypot(dx, dy) < 5) return;
    if (!dragged.current) {
      dragged.current = true;
      leave();
      stage.current!.classList.add("grabbing");
      try { stage.current!.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    }
    gesture.current = g1;
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    if (g0.d && g1.d) {
      const r = stage.current!.getBoundingClientRect();
      zoomAt(g1.x - r.left, g1.y - r.top, g1.d / g0.d);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    gesture.current = pointers.current.size ? measure() : null;
    if (!pointers.current.size) {
      stage.current!.classList.remove("grabbing");
      setTimeout(() => (dragged.current = false), 0); // let the click that follows a drag be ignored
    }
  };

  // ── Being sent to a title from the drawer ────────────────────────────────
  useEffect(() => {
    if (!focus) return;
    const t = BY_ID[focus.id];
    const need = t.id === DOOM_ID ? tier : tierFor(t);
    if (MIN_IMP[need] < MIN_IMP[tier]) { setTier(need); return; }
    const el = stage.current;
    const i = G.index[t.id];
    if (!el || i === undefined) return;
    const k = Math.max(viewRef.current.k, 0.7);
    setView({ k, x: el.clientWidth / 2 - G.cx(i) * k, y: el.clientHeight / 2 - G.cy(i) * k });
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, tier]);

  const count = (t: Tier) => TITLES.filter((x) => x.id !== DOOM_ID && x.imp >= MIN_IMP[t]).length;
  const doomI = G.stops.length - 1;
  const done = G.list.filter((t) => watched.has(t.id)).length;

  return (
    <section id="timeline" className="tree-section">
      <header className="tree-head">
        <div>
          <h2>The watch order</h2>
          <p>Start at 1 and go in order. Tap the tick on a poster once you've watched it, or tap the poster for details.</p>
        </div>
        <div className="seg" role="group" aria-label="How much to show">
          {VIEWS.map((v) => (
            <button key={v.tier} className={tier === v.tier ? "on" : ""} onClick={() => { setTier(v.tier); track("map_view", { view: v.tier }); }}>
              {v.label} <small>{count(v.tier)}</small>
            </button>
          ))}
        </div>
      </header>

      <div className={`progress${done === G.list.length ? " full" : ""}`}>
        <span>
          <b>{done}</b> of {G.list.length} watched
          {done === G.list.length ? ". You're ready for Doomsday." : done === 0 ? ". Tick the corner of a poster once you've seen it." : ""}
        </span>
        {watched.size > 0 ? (
          <button className="btn btn-primary progress-share" onClick={() => { setSharing(true); track("share_card_clicked", { from: "watch_order" }); }}>
            Share my doom-ready %
          </button>
        ) : <em>{Math.round((done / G.list.length) * 100)}%</em>}
        <div className="progress-bar" role="progressbar" aria-label="Watched in this view" aria-valuemin={0} aria-valuemax={G.list.length} aria-valuenow={done}>
          <i style={{ transform: `scaleX(${done / G.list.length})` }} />
        </div>
      </div>
      {sharing && (
        <Suspense fallback={null}>
          <ShareCard ready={doomReady(watched)} onClose={() => setSharing(false)} />
        </Suspense>
      )}

      <div
        className="tree-stage"
        ref={stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => { if (dragged.current) { e.stopPropagation(); e.preventDefault(); } }}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          const r = e.currentTarget.getBoundingClientRect();
          zoomAt(e.clientX - r.left, e.clientY - r.top, 1.6);
        }}
      >
        <div className={`tree${links ? " has-lit" : ""}`}
          style={{ width: G.width, height: G.height, transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.k})` }}>
          <svg className="edges" width={G.width} height={G.height} aria-hidden="true">
            <path className="road-line" d={G.d} />
            {G.arrows.map((a, i) => (
              <path key={i} className="road-arrow" d="M-5 -6L5 0L-5 6" transform={`translate(${a.x} ${a.y}) rotate(${a.a})`} />
            ))}
            {links?.pairs.map(([from, to]) => (
              <line key={`${from}>${to}`} className="link" x1={G.cx(G.index[from])} y1={G.cy(G.index[from])} x2={G.cx(G.index[to])} y2={G.cy(G.index[to])} />
            ))}
          </svg>

          {G.list.map((t, i) => (
            <button
              key={t.id}
              data-title={t.id}
              className={`tile${links?.set.has(t.id) ? " lit" : ""}${selected === t.id ? " sel" : ""}${watched.has(t.id) ? " seen" : ""}`}
              style={{ left: G.cx(i), top: G.cy(i) - PH / 2 }}
              onMouseEnter={(e) => { if (!dragged.current) enter(t.id, e.currentTarget.querySelector(".art") as HTMLElement); }}
              onMouseLeave={leave}
              onClick={() => onSelect(selected === t.id ? null : t.id)}
            >
              <span className="art">
                <i>{t.year}</i>
                <em className="num" aria-label={`Watch number ${i + 1}`}>{i + 1}</em>
                <Poster src={t.poster || posters[t.id]} />
              </span>
              <b>{t.title}</b>
            </button>
          ))}

          {/* A tick on each poster's corner marks it watched without opening the panel. */}
          {G.list.map((t, i) => (
            <button
              key={`mark-${t.id}`}
              className={`mark${watched.has(t.id) ? " on" : ""}`}
              style={{ left: G.cx(i) + PW / 2 - 26, top: G.cy(i) - PH / 2 }}
              onClick={() => toggleWatched(t.id)}
              aria-pressed={watched.has(t.id)}
              aria-label={`${watched.has(t.id) ? "Unmark" : "Mark"} ${t.title} as watched`}
              title={watched.has(t.id) ? "Watched, click to undo" : "Mark as watched"}
            >✓</button>
          ))}

          <button
            data-title={DOOM_ID}
            className={`doom${links?.set.has(DOOM_ID) ? " lit" : ""}${selected === DOOM_ID ? " sel" : ""}`}
            style={{ left: G.cx(doomI), top: G.cy(doomI), width: DOOM_R * 2, height: DOOM_R * 2 }}
            onMouseEnter={() => setHover(DOOM_ID)}
            onMouseLeave={leave}
            onClick={() => onSelect(selected === DOOM_ID ? null : DOOM_ID)}
          >
            <small>Avengers</small>
            <b>Doomsday</b>
            <span>{RELEASE[region].d} · 12 · 2026</span>
          </button>
        </div>

        <span className="stage-hint">Drag to move · pinch or Ctrl + scroll to zoom</span>
        <div className="stage-tools" onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          <button onClick={() => zoomBy(1.35)} aria-label="Zoom in">+</button>
          <button onClick={() => zoomBy(1 / 1.35)} aria-label="Zoom out">−</button>
          <button className="wide" onClick={() => fit(true)}>Fit all</button>
          <button className="wide" onClick={() => fit(false)}>Reset</button>
        </div>
      </div>

      {card && !selected && (
        <aside className={`hover-card${card.flip ? " flip" : ""}`} style={{ left: card.x, top: card.y }} aria-hidden="true">
          <b>{G.index[card.id] + 1}. {BY_ID[card.id].title}</b>
          <span>{BY_ID[card.id].year} · {BY_ID[card.id].kind === "film" ? "Film" : BY_ID[card.id].kind === "series" ? "Series" : "Special"} · {fmtMin(BY_ID[card.id].min)}</span>
          <p>{BY_ID[card.id].why}</p>
        </aside>
      )}
    </section>
  );
}
