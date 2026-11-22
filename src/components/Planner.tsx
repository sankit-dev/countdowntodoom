import { useEffect, useMemo, useState } from "react";
import { daysToDoom } from "../App";
import { RELEASE, useNow, useRegion } from "../release";
import { BY_ID, LANE_BY_ID, TIER_LABEL, fmtMin, tierOf } from "../data";
import { buildPlan } from "../planner";

import { Poster, usePosters } from "../posters";

interface Props {
  watched: Set<string>;
  onSelect: (id: string | null, travel?: boolean) => void;
}

const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });
const shortFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric" });

export function Planner({ watched, onSelect }: Props) {
  const posters = usePosters();
  const [region] = useRegion();
  const now = useNow();
  const left = daysToDoom(region, now);
  // You can only plan up to release day: the slider tops out at the days actually left.
  // (After release it still works for catching up later, up to 60 days.)
  const maxDays = left > 0 ? left : 60;
  const [days, setDays] = useState(left > 0 ? left : 14);
  // Until you move the slider yourself it follows the days left, so it ticks
  // down with the countdown. Once you've picked a number it is only capped.
  const [picked, setPicked] = useState(false);
  useEffect(() => { setDays((d) => (picked ? Math.min(d, maxDays) : left > 0 ? left : Math.min(d, maxDays))); }, [maxDays, left, picked]);
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

  // Each title sits under the day it starts on.
  const groups = useMemo(() => {
    const out: { day: number; items: typeof entries }[] = [];
    for (const en of entries) {
      const day = en.parts[0].day;
      const g = out[out.length - 1];
      if (g && g.day === day) g.items.push(en);
      else out.push({ day, items: [en] });
    }
    return out;
  }, [entries]);
  const pad2 = (d: number) => String(d + 1).padStart(2, "0");

  const today = new Date(now);
  const shortOf = (i: number) => shortFmt.format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
  const dateOf = (i: number) => dayFmt.format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));

  return (
    <section id="planner" className="planner">
      <header className="sec-head">
        <h2>How much time do you have?</h2>
        <p className="lede">Tell me how many days and hours you've got. I'll pick the most important stuff and put it in order, day by day.</p>
      </header>

      <div className="planner-grid">
        <form className="controls" onSubmit={(e) => e.preventDefault()}>
          <div className="ctl">
            <div className="ctl-head">
              <label htmlFor="days">Days you've got</label>
              <output htmlFor="days">{days}</output>
            </div>
            <input id="days" type="range" min={1} max={maxDays} value={days} onChange={(e) => { setDays(+e.target.value); setPicked(+e.target.value !== left); }}
              disabled={maxDays <= 1}
              style={{ ["--fill" as string]: `${maxDays > 1 ? ((days - 1) / (maxDays - 1)) * 100 : 100}%` }} />
            {left > 0 && (
              <p className="ctl-hint">
                {days === left ? `That's every day until release on ${RELEASE[region].short}.` : <>
                  Leaves {left - days} spare {left - days === 1 ? "day" : "days"} before release.{" "}
                  <button type="button" className="use-all" onClick={() => { setDays(left); setPicked(false); }}>Use all {left}</button>
                </>}
              </p>
            )}
          </div>
          <div className="ctl">
            <div className="ctl-head">
              <label htmlFor="hours">Hours a day</label>
              <output htmlFor="hours">{hours}</output>
            </div>
            <input id="hours" type="range" min={0.5} max={10} step={0.5} value={hours} onChange={(e) => setHours(+e.target.value)}
              style={{ ["--fill" as string]: `${((hours - 0.5) / 9.5) * 100}%` }} />
          </div>
          <div className="ctl">
            <span className="ctl-label" id="order-label">Watch order</span>
            <div className="seg ctl-seg" role="group" aria-labelledby="order-label">
              <button type="button" className={order === "release" ? "on" : ""} onClick={() => setOrder("release")}>Release</button>
              <button type="button" className={order === "story" ? "on" : ""} onClick={() => setOrder("story")}>Story order</button>
            </div>
          </div>
          <label className="ctl ctl-switch" htmlFor="series">
            <span className="ctl-label">Include shows</span>
            <input id="series" type="checkbox" role="switch" checked={includeSeries} onChange={(e) => setIncludeSeries(e.target.checked)} />
          </label>
          <p className="ctl-note">
            {watched.size
              ? `${watched.size} title${watched.size === 1 ? "" : "s"} you've watched ${watched.size === 1 ? "is" : "are"} left out.`
              : "Anything you tick as watched on the watch order gets left out here."}
          </p>
        </form>

        <div className="results">
          {/* One line of numbers, then one sentence. Sharing your % lives in the footer and the watch order. */}
          {plan.picked.length > 0 && (
            <p className="plan-sum">
              <span><b>{plan.picked.length}</b> {plan.picked.length === 1 ? "title" : "titles"}</span>
              <span><b>{fmtMin(plan.totalMin)}</b> total</span>
              <span><b>{plan.essentialsPicked}/{plan.essentialsTotal}</b> essentials</span>
            </p>
          )}
          <p className="verdict">{verdict}</p>

          {/* Grouped by day: one header per day, then a compact row per title. A long
              title split across days sits under the day it starts, with its span noted. */}
          <ol className="days">
            {groups.map(({ day, items }) => {
              const mins = plan.days[day].reduce((n, sl) => n + sl.minutes, 0);
              return (
                <li key={day} className="day">
                  <div className="day-head">
                    <small>Day</small>
                    <b>{pad2(day)}</b>
                    <span title={dateOf(day)}>{shortOf(day)}</span>
                    {items.length > 1 && <em>{fmtMin(mins)}</em>}
                  </div>
                  <ul className="day-list">
                    {items.map((en) => {
                      const t = BY_ID[en.id];
                      const tier = tierOf(t);
                      const last = en.parts[en.parts.length - 1].day;
                      return (
                        <li key={en.id}>
                          <button className="row" data-tier={tier} onClick={() => onSelect(t.id)}>
                            <span className="row-art"><Poster src={t.poster || posters[t.id]} /></span>
                            <span className="row-body">
                              <span className="row-title">{t.title}</span>
                              <span className="row-meta">
                                {t.kind === "film" ? "Film" : t.kind === "series" ? "Series" : "Special"} · {fmtMin(t.min)}
                                <i>{TIER_LABEL[tier]}</i>
                              </span>
                              {en.parts.length > 1 && <span className="row-split">Spread over days {pad2(day)} to {pad2(last)}</span>}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
            {plan.picked.length > 0 && (
              <li className="day day-doom">
                <div className="day-head"><small>Out</small><b>{RELEASE[region].d}</b><span>Dec</span></div>
                <p className="day-doom-line">Avengers: Doomsday. You're ready, go book your tickets.</p>
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
