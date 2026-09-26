import React, { useCallback, useState } from "react";
import DragonBoatSchematic, {
  BOAT_NOTES,
  BOAT_PARTS,
} from "./schematics/DragonBoatSchematic";
import FintechSchematic from "./schematics/FintechSchematic";
import MedalPlot from "./MedalPlot";
import { Parallax, Reveal, useMediaQuery } from "./ui/motion";
import "./Activities.css";

export default function Activities() {
  // Same selection model as the vessel: hovering or focusing previews a
  // crew position, clicking or tapping pins it until picked again.
  const [pinned, setPinned] = useState(null);
  const [hovered, setHovered] = useState(null);
  const active = hovered ?? pinned;
  const pick = useCallback(
    (i) => setPinned((current) => (current === i ? null : i)),
    [],
  );
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  return (
    <section
      id="activities"
      className="section activities"
      aria-labelledby="activities-title"
    >
      <div className="container">
        <Parallax distance={56}>
          <Reveal as="h2" className="section-title" id="activities-title">
            At NUS
          </Reveal>
        </Parallax>

        <div className="bento">
          <Reveal
            as="article"
            className="cell cell--boat"
            aria-labelledby="boat-title"
          >
            <header className="cell__head">
              <h3 id="boat-title" className="cell__title">
                NUS Dragon Boat
              </h3>
              <p className="cell__role">Member since Aug 2023</p>
            </header>
            <p className="cell__text">
              Racing with a team of 30+ in tertiary and open categories, from
              100&nbsp;m sprints to the 1000&nbsp;m Prime Minister's Cup.
            </p>
            <div className="boat">
              <div className="boat__drawing">
                <DragonBoatSchematic
                  active={active}
                  onHover={setHovered}
                  onPick={pick}
                />
                <ol className="boat__parts" aria-label="Crew positions">
                  {BOAT_PARTS.map((part, i) => (
                    <li key={part}>
                      <button
                        type="button"
                        className={`part${active === i ? " is-active" : ""}`}
                        aria-pressed={pinned === i}
                        onClick={() => pick(i)}
                        onPointerEnter={(e) =>
                          e.pointerType === "mouse" && setHovered(i)
                        }
                        onPointerLeave={(e) =>
                          e.pointerType === "mouse" && setHovered(null)
                        }
                        onFocus={() => setHovered(i)}
                        onBlur={() => setHovered(null)}
                      >
                        <span className="balloon mono" aria-hidden="true">
                          {i + 1}
                        </span>
                        {part}
                      </button>
                    </li>
                  ))}
                </ol>
                <p className="readout" aria-live="polite">
                  {active === null ? (
                    `${finePointer ? "Hover over" : "Tap"} a crew position to learn more.`
                  ) : (
                    <>
                      <strong>{BOAT_PARTS[active]}.</strong>{" "}
                      {BOAT_NOTES[active]}
                    </>
                  )}
                </p>
              </div>
              <MedalPlot />
            </div>
          </Reveal>

          <Reveal
            as="article"
            className="cell cell--fintech"
            delay={0.08}
            aria-labelledby="fintech-title"
          >
            <header className="cell__head">
              <h3 id="fintech-title" className="cell__title">
                NUS FinTech Society
              </h3>
              <p className="cell__role">ML Analyst since Sep 2026</p>
            </header>
            <p className="cell__text">
              Building a low-latency credit-risk inference engine for instant
              checkout financing, combining tabular credit models with
              DistilBERT signals from transaction text.
            </p>
            <Parallax className="cell__diagram" distance={44}>
              <FintechSchematic />
            </Parallax>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
