import React, { useState } from "react";
import { races } from "../data/content";

// Unit dot plot: one dot per podium, stacked by race distance. Medals are an
// ordinal scale: one warm ramp, gold lightest to bronze darkest, with
// lightness order and contrast checked against the page background.
const DISTANCES = [100, 200, 500, 1000];
const MEDALS = [
  { id: "gold", label: "Gold" },
  { id: "silver", label: "Silver" },
  { id: "bronze", label: "Bronze" },
];
const RANK = { gold: 0, silver: 1, bronze: 2 };

const describe = (r) => `${r.year ? `${r.year} ` : ""}${r.event}`;

export default function MedalPlot() {
  const [active, setActive] = useState(null);
  const counts = MEDALS.map((m) => ({
    ...m,
    count: races.filter((r) => r.medal === m.id).length,
  }));

  return (
    <figure className="medals">
      <div className="medals__hero">
        <span className="medals__total">{races.length}</span>
        <span className="medals__caption">
          podium finishes since 2023, by race distance
        </span>
      </div>

      <div className="medals__plot" onPointerLeave={() => setActive(null)}>
        {DISTANCES.map((distance) => {
          const stack = races
            .map((race, index) => ({ ...race, index }))
            .filter((race) => race.distance === distance)
            .sort(
              (a, b) =>
                RANK[a.medal] - RANK[b.medal] ||
                String(a.year).localeCompare(String(b.year)),
            );
          return (
            <div key={distance} className="medals__col">
              <ul
                className="medals__stack"
                aria-label={`${distance} metre races`}
              >
                {stack.map((race) => {
                  const isActive = active === race.index;
                  return (
                    <li key={race.index}>
                      <button
                        type="button"
                        className={`medal medal--${race.medal}${isActive ? " is-active" : ""}`}
                        aria-label={`${race.medal}, ${describe(race)}, ${race.race}`}
                        onPointerEnter={() => setActive(race.index)}
                        onFocus={() => setActive(race.index)}
                        onBlur={() => setActive(null)}
                      >
                        <span className="medal__dot" aria-hidden="true" />
                      </button>
                      {isActive && (
                        <span className="medals__tip" role="tooltip">
                          <strong>{MEDALS[RANK[race.medal]].label}</strong>
                          <span>{describe(race)}</span>
                          <span className="medals__tip-race">{race.race}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <span className="medals__axis mono">{distance} m</span>
            </div>
          );
        })}
      </div>

      <ul className="medals__legend" aria-label="Legend">
        {counts.map((m) => (
          <li key={m.id}>
            <span
              className={`medal__dot medal__dot--${m.id}`}
              aria-hidden="true"
            />
            {m.label}
            <span className="mono">{m.count}</span>
          </li>
        ))}
      </ul>

      <details className="medals__table">
        <summary>All {races.length} results</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Event</th>
              <th scope="col">Race</th>
              <th scope="col">Medal</th>
            </tr>
          </thead>
          <tbody>
            {races.map((r) => (
              <tr key={`${r.event}-${r.race}-${r.year}`}>
                <td className="mono">{r.year || "-"}</td>
                <td>{r.event}</td>
                <td>{r.race}</td>
                <td>{MEDALS[RANK[r.medal]].label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
