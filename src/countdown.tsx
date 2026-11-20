import { createRoot } from "react-dom/client";
import { useCountdown } from "./components/Hero";
import { useBackdrop } from "./backdrop";
import "./styles.css";

// The /countdown page: the clock and nothing else.
//
// Background: public/doom-throne.jpg if that file exists. Otherwise the lead
// image of the film's Wikipedia article is loaded in the visitor's browser.
function Countdown() {
  const c = useCountdown();
  const bg = useBackdrop("../doom-throne.jpg");
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
