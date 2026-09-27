import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { PiCaretDown } from "react-icons/pi";
import { races } from "../data/content";

// Unit dot plot: one dot per podium, stacked by race distance. Medals are an
// ordinal scale: one warm ramp, gold lightest to bronze darkest, with
// lightness order and contrast checked against the page background.
const DISTANCES = [100, 200, 500, 1000, 5000];
// 5000 reads as 5 km; shorter races stay in metres.
const distanceLabel = (d) => (d >= 5000 ? `${d / 1000} km` : `${d} m`);
const MEDALS = [
  { id: "gold", label: "Gold" },
  { id: "silver", label: "Silver" },
  { id: "bronze", label: "Bronze" },
];
const RANK = { gold: 0, silver: 1, bronze: 2 };

const describe = (r) => `${r.year ? `${r.year} ` : ""}${r.event}`;

// Results list: newest first. `races` is in CV order (oldest first), so
// within a year the later entry comes first too.
const RESULTS = races
  .map((race, index) => ({ ...race, index }))
  .sort(
    (a, b) =>
      (Number(b.year) || 0) - (Number(a.year) || 0) || b.index - a.index,
  );

export default function MedalPlot() {
  // active: a dot being hovered or focused (shows its tooltip).
  // linked: a result row being hovered (lifts its dot).
  const [active, setActive] = useState(null);
  const [linked, setLinked] = useState(null);
  // The results list starts hidden; the toggle shows and hides it.
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const scroller = useRef(null);
  const rows = useRef({});
  const counts = MEDALS.map((m) => ({
    ...m,
    count: races.filter((r) => r.medal === m.id).length,
  }));

  // Pointing at a dot scrolls the results list (not the page) to its row.
  useEffect(() => {
    const box = scroller.current;
    const row = rows.current[active];
    if (!open || active === null || !box || !row) return;
    const head = box.querySelector("thead")?.offsetHeight || 0;
    const top = row.offsetTop - head;
    const bottom = row.offsetTop + row.offsetHeight - box.clientHeight;
    if (box.scrollTop > top || box.scrollTop < bottom) {
      box.scrollTo({
        top: box.scrollTop > top ? top : bottom + 12,
        behavior: reduce ? "auto" : "smooth",
      });
    }
  }, [active, open, reduce]);

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
                aria-label={`${distanceLabel(distance)} races`}
              >
                {stack.map((race) => {
                  const isActive = active === race.index;
                  const isLit = isActive || linked === race.index;
                  return (
                    <li key={race.index}>
                      <button
                        type="button"
                        className={`medal medal--${race.medal}${isLit ? " is-active" : ""}`}
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
              <span className="medals__axis mono">
                {distanceLabel(distance)}
              </span>
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

      <div className="medals__results">
        <button
          type="button"
          id="medal-results"
          className="medals__toggle"
          aria-expanded={open}
          aria-controls="medal-results-list"
          onClick={() => setOpen((value) => !value)}
        >
          All {races.length} results
          <PiCaretDown aria-hidden="true" />
        </button>
        {/* When shown, the list fills the space under the plot and scrolls
            inside it instead of stretching the card. */}
        <div
          ref={scroller}
          id="medal-results-list"
          className={`medals__scroll${open ? " is-open" : ""}`}
          role="region"
          aria-labelledby="medal-results"
          tabIndex={open ? 0 : -1}
        >
          <table className="medals__table">
            <thead>
              <tr>
                <th scope="col">Medal</th>
                <th scope="col">Race</th>
              </tr>
            </thead>
            <tbody>
              {RESULTS.map((r) => (
                <tr
                  key={r.index}
                  ref={(el) => {
                    rows.current[r.index] = el;
                  }}
                  className={
                    active === r.index || linked === r.index
                      ? "is-linked"
                      : undefined
                  }
                  onPointerEnter={() => setLinked(r.index)}
                  onPointerLeave={() => setLinked(null)}
                >
                  <td>
                    <span className="medals__medal">
                      <span
                        className={`medal__dot medal__dot--${r.medal}`}
                        aria-hidden="true"
                      />
                      {MEDALS[RANK[r.medal]].label}
                    </span>
                  </td>
                  <td>
                    <span className="medals__race">{r.race}</span>
                    <span className="medals__event">
                      {r.event}
                      {r.year && (
                        <>
                          , <span className="mono">{r.year}</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </figure>
  );
}
