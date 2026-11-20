import { createRoot } from "react-dom/client";
import { useCountdown } from "./components/Hero";
import "./styles.css";

// The /countdown page: the clock and nothing else.
// Background image: public/doom-throne.jpg (the page is plain black without it).
function Countdown() {
  const c = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <main className="cd">
      <div className="cd-bg" style={{ backgroundImage: 'url("../doom-throne.jpg")' }} aria-hidden="true" />
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
