import { Suspense, lazy, useMemo, useState } from "react";
import { daysToDoom } from "../App";
import { RELEASE, useRegion } from "../release";
import { BY_ID, LANE_BY_ID, TIER_LABEL, fmtMin, tierOf } from "../data";
import { buildPlan } from "../planner";
import { doomReady } from "../doomReady";

const ShareCard = lazy(() => import("./ShareCard"));
import { Poster, usePosters } from "../posters";

interface Props {
  watched: Set<string>;
  onSelect: (id: string | null, travel?: boolean) => void;
}

const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });

export function Planner({ watched, onSelect }: Props) {
  const posters = usePosters();
  const [region] = useRegion();
  const left = daysToDoom(region);
  const ready = useMemo(() => doomReady(watched), [watched]);
  const [sharing, setSharing] = useState(false);
  const [days, setDays] = useState(left > 0 ? Math.min(left, 120) : 14);
  const [hours, setHours] = useState(2.5);
  const [includeSeries, setIncludeSeries] = useState(true);
  const [order, setOrder] = useState<"release" | "story">("release");

  const plan = useMemo(
    () => buildPlan({ days, hoursPerDay: hours, includeSeries, order, watched }),
    [days, hours, includeSeries, order, watched]
  );

  const usedDays = plan.days.filter((d) => d.length).length;
  const entries = useMemo(() => {
    const out: { id: string; parts: { day: number; minutes: number }[] }[] = [];
    plan.days.forEach((slots, day) =>
      slots.forEach((sl) => {
        const prev = out[out.length - 1];
        if (prev && prev.id === sl.id && sl.part !== "whole" && sl.part !== "start") prev.parts.push({ day, minutes: sl.minutes });
        else out.push({ id: sl.id, parts: [{ day, minutes: sl.minutes }] });
      })
    );
    return out;
  }, [plan]);
  const verdict =
    plan.skipped.length === 0
      ? "You've got time for everything. Nice."
      : plan.essentialsPicked === plan.essentialsTotal
      ? `All ${plan.essentialsTotal} essentials fit, plus some extra good ones.`
      : plan.picked.length
      ? "It's tight, so this is the shortest list that still gets you ready."
      : "That's not enough time for even one title. Add a bit more per day.";

  const today = new Date();
  const dateOf = (i: number) => dayFmt.format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));

  return (
    <section id="planner" className="planner">
      <header className="sec-head">
        <h2>How much time do you have?</h2>
        <p className="lede">Tell me how many days and hours you've got. I'll pick the most important stuff and put it in order, day by day.</p>
      </header>

      <div className="planner-grid">
        <form className="controls" onSubmit={(e) => e.preventDefault()}>
          <label className="slider">
            <span>Days available <b>{days}</b></span>
            <input type="range" min={1} max={120} value={days} onChange={(e) => setDays(+e.target.value)} />
            {left > 0 && left <= 120 && days !== left && (
              <button type="button" className="link" onClick={() => setDays(left)}>Use all {left} days till release</button>
            )}
          </label>
          <label className="slider">
            <span>Hours per day <b>{hours}</b></span>
            <input type="range" min={0.5} max={10} step={0.5} value={hours} onChange={(e) => setHours(+e.target.value)} />
          </label>
          <fieldset>
            <legend>Watch order</legend>
            <div className="seg">
              <button type="button" className={order === "release" ? "on" : ""} onClick={() => setOrder("release")}>Release</button>
              <button type="button" className={order === "story" ? "on" : ""} onClick={() => setOrder("story")}>Story chronology</button>
            </div>
          </fieldset>
          <label className="check">
            <input type="checkbox" checked={includeSeries} onChange={(e) => setIncludeSeries(e.target.checked)} />
            <span>Include series</span>
          </label>
          <p className="dim small">
            {watched.size
              ? `${watched.size} title${watched.size === 1 ? "" : "s"} you've watched ${watched.size === 1 ? "is" : "are"} left out.`
              : "Anything you tick as watched on the watch order gets left out here."}
          </p>
        </form>

        <div className="results">
          {/* How ready you are now: only titles you've ticked count. */}
          <div className="doom-ready" style={{ ["--p" as string]: ready.pct }}>
            <div className="doom-ready-num">
              <b>{ready.pct}<small>%</small></b>
              <span>Doom-ready</span>
            </div>
            <div className="doom-ready-body">
              <p>
                <strong>{ready.essentials}/{ready.essentialsTotal}</strong> essentials watched.{" "}
                {ready.pct === 0 ? "Tick what you've seen on the watch order and this goes up." : "This is based on what you've ticked."}
              </p>
              <i className="doom-ready-bar"><i /></i>
            </div>
            <button className="btn btn-primary doom-ready-share" onClick={() => setSharing(true)}>Share my doom-ready %</button>
          </div>

          <div className="stats">
            <div className="stat stat-ring" style={{ ["--p" as string]: plan.readiness }}>
              <b>{plan.readiness}<small>%</small></b>
              <span>Ready by release</span>
            </div>
            <div className="stat"><b>{plan.picked.length}</b><span>Titles to watch</span></div>
            <div className="stat"><b>{fmtMin(plan.totalMin)}</b><span>Total runtime</span></div>
            <div className="stat"><b>{plan.essentialsPicked}<small>/{plan.essentialsTotal}</small></b><span>Essentials covered</span></div>
          </div>
          <p className="verdict">{verdict}</p>

          {sharing && (
            <Suspense fallback={null}>
              <ShareCard ready={ready} onClose={() => setSharing(false)} />
            </Suspense>
          )}

          <ol className="listing">
            {entries.map((en) => {
              const t = BY_ID[en.id];
              const lane = LANE_BY_ID[t.lane];
              const first = en.parts[0].day, last = en.parts[en.parts.length - 1].day;
              const multi = en.parts.length > 1;
              const pad = (d: number) => String(d + 1).padStart(2, "0");
              return (
                <li key={`${en.id}-${first}`} className={`item ${tierOf(t) === "essential" ? "item-big" : "item-small"}`} style={{ ["--c" as string]: lane.color }}>
                  <button onClick={() => onSelect(t.id)}>
                    <span className="item-art"><Poster src={t.poster || posters[t.id]} /></span>
                    <span className="item-body">
                      <span className="item-day">
                        <b>{multi ? `Days ${pad(first)} to ${pad(last)}` : `Day ${pad(first)}`}</b>
                        {multi ? `${dateOf(first)} – ${dateOf(last)}` : dateOf(first)}
                      </span>
                      <span className="item-title">{t.title}</span>
                      <span className="item-meta">
                        <span>{t.year}</span>
                        <span>{t.kind === "film" ? "Film" : t.kind === "series" ? "Series" : "Special"}</span>
                        <span>{fmtMin(t.min)}</span>
                        <i>{TIER_LABEL[tierOf(t)]}</i>
                      </span>
                      {multi && (
                        <span className="item-split">
                          Split over {en.parts.length} days: {en.parts.map((p) => `Day ${pad(p.day)} ${fmtMin(p.minutes)}`).join(" · ")}
                        </span>
                      )}
                      <span className="item-why">{t.why}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {plan.picked.length > 0 && (
              <li className="item item-doom" style={{ ["--c" as string]: "var(--doom)" }}>
                <div>
                  <span className="item-art"><Poster src={posters.doomsday} /></span>
                  <span className="item-body">
                    <span className="item-day"><b>Then</b>{RELEASE[region].date}</span>
                    <span className="item-title">Avengers: Doomsday</span>
                    <span className="item-why">You're ready. Go book your tickets.</span>
                  </span>
                </div>
              </li>
            )}
          </ol>
          {usedDays > 0 && usedDays < days && (
            <p className="dim small">You'll be done in {usedDays} of your {days} days, so {days - usedDays} {days - usedDays === 1 ? "day" : "days"} to spare.</p>
          )}

          {plan.skipped.length > 0 && (
            <details className="skipped">
              <summary>{plan.skipped.length} {plan.skipped.length === 1 ? "title" : "titles"} didn't fit</summary>
              <div className="chips">
                {plan.skipped.map((t) => (
                  <button key={t.id} className="chip" style={{ ["--c" as string]: LANE_BY_ID[t.lane].color }} onClick={() => onSelect(t.id)}>
                    {t.title}
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
