import { track } from "../analytics";
import { EXTRAS } from "../extras";
import { Poster, usePosters } from "../posters";

/** "Not needed, but people always ask": the other Marvel movies, folded away under the watch order. */
export function Extras() {
  const posters = usePosters();
  const total = EXTRAS.reduce((n, g) => n + g.items.length, 0);
  return (
    <details className="extras" onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && track("extras_open")}>
      <summary>
        <span>
          <b>Extras: other Marvel movies</b>
          <small>Venom, Blade, Logan, the old Spider-Man and X-Men films and more. None of them are needed for Doomsday.</small>
        </span>
        <em>{total}</em>
      </summary>
      <div className="extras-body">
        {EXTRAS.map((g) => (
          <section key={g.name}>
            <h3>{g.name}</h3>
            <ul>
              {g.items.map((x) => (
                <li key={x.id} className="extra">
                  <span className="row-art"><Poster src={posters[x.id]} /></span>
                  <span className="extra-body">
                    <b>{x.title} <small>{x.year}</small></b>
                    <span>{x.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  );
}
