import { useMemo, useState } from "react";
import { daysToDoom } from "../App";
import { BY_ID, LANE_BY_ID, fmtMin } from "../data";
import { buildPlan } from "../planner";

interface Props {
  watched: Set<string>;
  onSelect: (id: string | null, travel?: boolean) => void;
}

const PART = { whole: "", start: "start", middle: "continue", end: "finish" } as const;
const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });

export function Planner({ watched, onSelect }: Props) {
  const left = daysToDoom();
  const [days, setDays] = useState(left > 0 ? Math.min(left, 120) : 14);
  const [hours, setHours] = useState(2.5);
  const [includeSeries, setIncludeSeries] = useState(true);
  const [order, setOrder] = useState<"release" | "story">("release");

  const plan = useMemo(
    () => buildPlan({ days, hoursPerDay: hours, includeSeries, order, watched }),
    [days, hours, includeSeries, order, watched]
  );

  const usedDays = plan.days.filter((d) => d.length).length;
  const verdict =
    plan.skipped.length === 0
      ? "You have time for the full marathon. Everything is in."
      : plan.essentialsPicked === plan.essentialsTotal
      ? "Every essential fits, plus the best of the rest."
      : plan.picked.length
      ? "Tight schedule — this is the sharpest cut that still gets you ready."
      : "Not enough time for a full title. Add a little more per day.";

  const today = new Date();
  const dateOf = (i: number) => dayFmt.format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));

  return (
    <section id="planner" className="planner">
      <header className="sec-head">
        <p className="kicker">The marathon planner</p>
        <h2>How much time do you have?</h2>
        <p className="lede">Tell it your days and your hours. It picks what matters most for Doomsday, puts it in order and lays it out day by day.</p>
      </header>

      <div className="planner-grid">
        <form className="controls" onSubmit={(e) => e.preventDefault()}>
          <label className="slider">
            <span>Days available <b>{days}</b></span>
            <input type="range" min={1} max={120} value={days} onChange={(e) => setDays(+e.target.value)} />
            {left > 0 && left <= 120 && days !== left && (
              <button type="button" className="link" onClick={() => setDays(left)}>Use all {left} days until release</button>
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
              ? `${watched.size} title${watched.size === 1 ? "" : "s"} marked as watched and left out.`
              : "Mark titles as watched on the timeline and they are left out here."}
          </p>
        </form>

        <div className="results">
          <div className="stats">
            <div className="stat stat-ring" style={{ ["--p" as string]: plan.readiness }}>
              <b>{plan.readiness}<small>%</small></b>
              <span>Doom-ready</span>
            </div>
            <div className="stat"><b>{plan.picked.length}</b><span>Titles to watch</span></div>
            <div className="stat"><b>{fmtMin(plan.totalMin)}</b><span>Total runtime</span></div>
            <div className="stat"><b>{plan.essentialsPicked}<small>/{plan.essentialsTotal}</small></b><span>Essentials covered</span></div>
          </div>
          <p className="verdict">{verdict}</p>

          <ol className="days">
            {plan.days.map((slots, i) =>
              slots.length ? (
                <li key={i} className="day">
                  <header>
                    <b>Day {String(i + 1).padStart(2, "0")}</b>
                    <span>{dateOf(i)}</span>
                    <em>{fmtMin(slots.reduce((n, s) => n + s.minutes, 0))}</em>
                  </header>
                  {slots.map((s, k) => {
                    const t = BY_ID[s.id];
                    return (
                      <button key={k} className="slot" style={{ ["--c" as string]: LANE_BY_ID[t.lane].color }} onClick={() => onSelect(t.id)}>
                        <span className="slot-title">{t.title}</span>
                        <span className="slot-meta">
                          {PART[s.part] && <i>{PART[s.part]}</i>}
                          {fmtMin(s.minutes)}
                        </span>
                      </button>
                    );
                  })}
                </li>
              ) : null
            )}
            {plan.picked.length > 0 && (
              <li className="day day-doom">
                <header><b>Then</b><span>18 December 2026</span></header>
                <p>Avengers: Doomsday</p>
              </li>
            )}
          </ol>
          {usedDays > 0 && usedDays < days && (
            <p className="dim small">Done in {usedDays} of your {days} days — {days - usedDays} to spare.</p>
          )}

          {plan.skipped.length > 0 && (
            <details className="skipped">
              <summary>{plan.skipped.length} left out to fit your time</summary>
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
