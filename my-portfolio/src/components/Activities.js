import React from "react";
import DragonBoatSchematic, {
  BOAT_PARTS,
} from "./schematics/DragonBoatSchematic";
import FintechSchematic from "./schematics/FintechSchematic";
import MedalPlot from "./MedalPlot";
import { Reveal } from "./ui/motion";
import "./Activities.css";

export default function Activities() {
  return (
    <section
      id="activities"
      className="section activities"
      aria-labelledby="activities-title"
    >
      <div className="container">
        <Reveal as="h2" className="section-title" id="activities-title">
          At NUS
        </Reveal>

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
                <DragonBoatSchematic />
                <ol className="boat__parts">
                  {BOAT_PARTS.map((part, i) => (
                    <li key={part}>
                      <span className="balloon mono" aria-hidden="true">
                        {i + 1}
                      </span>
                      {part}
                    </li>
                  ))}
                </ol>
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
              <p className="cell__role">ML Analyst</p>
            </header>
            <p className="cell__text">
              Building a low-latency credit-risk inference engine for instant
              checkout financing, combining tabular credit models with
              DistilBERT signals from transaction text.
            </p>
            <div className="cell__diagram">
              <FintechSchematic />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
