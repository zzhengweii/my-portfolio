import React, { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useDrawOnView } from "../ui/motion";
import "./DragonBoatSchematic.css";

// Top view of a DB22 boat, drawn like a crew lineup sheet: drummer at the
// bow, ten benches of two paddlers, steerer on the sweep oar at the stern.
// Once drawn, the crew paddles in time to the drum while the lane markers
// stream past, and scrolling the page pulls the boat up its lane.
export const BOAT_PARTS = [
  "Drummer",
  "Twenty paddlers on ten benches",
  "Coxswain",
];

const BENCHES = Array.from({ length: 10 }, (_, i) => 190 + i * 34);

export default function DragonBoatSchematic() {
  const ref = useRef(null);
  const drawn = useDrawOnView(ref, { amount: 0.25 });
  // Paused while off screen; every part pauses together, so the crew stays in time.
  const playing = useInView(ref, { amount: 0.05 });
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const advance = useTransform(scrollYProgress, [0, 1], [22, -22]);

  return (
    <svg
      ref={ref}
      className={`schematic schematic--boat draw${drawn ? " is-drawn" : ""}${playing ? " is-playing" : ""}`}
      viewBox="0 0 280 660"
      role="img"
      aria-label="Top view of a 22-crew dragon boat: a drummer at the bow, ten benches of two paddlers, and a steerer at the stern."
    >
      <defs>
        <linearGradient id="boat-lane-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.14" stopColor="#fff" />
          <stop offset="0.86" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask
          id="boat-lane-mask"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="280"
          height="660"
        >
          <rect width="280" height="660" fill="url(#boat-lane-fade)" />
        </mask>
      </defs>

      {/* Lane markers, fixed in the water while the boat moves */}
      <g
        className="boat-lanes"
        mask="url(#boat-lane-mask)"
        data-fade=""
        style={{ "--d": 700 }}
      >
        <line className="boat-lane" x1="6" y1="0" x2="6" y2="660" />
        <line className="boat-lane" x1="274" y1="0" x2="274" y2="660" />
      </g>

      <motion.g style={reduce ? undefined : { y: advance }}>
        <g className="boat-surge">
          {/* Overall length */}
          <g data-fade="" style={{ "--d": 900 }}>
            <line className="sx sx--dim" x1="30" y1="44" x2="30" y2="610" />
            <line className="sx sx--dim" x1="22" y1="44" x2="38" y2="44" />
            <line className="sx sx--dim" x1="22" y1="610" x2="38" y2="610" />
            <rect className="sx-fill" x="14" y="316" width="32" height="22" />
            <text className="sx-text" x="30" y="331" textAnchor="middle">
              DB22
            </text>
          </g>

          {/* Hull and gunwale */}
          <path
            className="sx"
            data-draw="0"
            d="M140 44 C166 72 186 116 186 164 L186 516 C186 560 168 592 140 610 C112 592 94 560 94 516 L94 164 C94 116 114 72 140 44 Z"
          />
          <path
            className="sx sx--dim"
            data-draw="160"
            d="M140 60 C162 84 179 122 179 166 L179 512 C179 552 163 580 140 596 C117 580 101 552 101 512 L101 166 C101 122 118 84 140 60 Z"
          />

          {/* Dragon head and tail */}
          <g data-fade="" style={{ "--d": 500 }}>
            <circle className="sx" cx="140" cy="26" r="8" />
            <path
              className="sx"
              d="M134 20 L127 9 M146 20 L153 9 M140 34 L140 44"
            />
            <path
              className="sx"
              d="M140 610 L131 630 M140 610 L149 630 M140 610 L140 636"
            />
          </g>

          {/* Drum, with a ring on every beat */}
          <circle className="boat-beat" cx="140" cy="126" r="12" />
          <circle
            className="sx boat-drum"
            data-draw="300"
            cx="140"
            cy="126"
            r="12"
          />
          <rect
            className="sx sx--dim"
            data-draw="360"
            x="130"
            y="146"
            width="20"
            height="8"
          />

          {/* Benches, paddlers and paddles */}
          {BENCHES.map((y, i) => (
            <g key={y}>
              <line
                className="sx sx--dim"
                data-draw={380 + i * 45}
                x1="101"
                y1={y}
                x2="179"
                y2={y}
              />
              <ellipse
                className="boat-puddle"
                cx="63"
                cy={y + 41}
                rx="4"
                ry="2.6"
              />
              <ellipse
                className="boat-puddle"
                cx="217"
                cy={y + 41}
                rx="4"
                ry="2.6"
              />
              <g className="boat-paddler">
                <circle
                  className="sx"
                  data-draw={420 + i * 45}
                  cx="118"
                  cy={y + 15}
                  r="8"
                />
                <circle
                  className="sx"
                  data-draw={440 + i * 45}
                  cx="162"
                  cy={y + 15}
                  r="8"
                />
              </g>
              <g
                className="boat-paddle"
                style={{ "--side": 1, transformOrigin: `94px ${y + 15}px` }}
              >
                <line
                  className="sx sx--dim"
                  data-draw={460 + i * 45}
                  x1="94"
                  y1={y + 15}
                  x2="64"
                  y2={y + 29}
                />
                <ellipse
                  className="sx sx--dim"
                  data-draw={500 + i * 45}
                  cx="60"
                  cy={y + 31}
                  rx="4"
                  ry="8"
                  transform={`rotate(-60 60 ${y + 31})`}
                />
              </g>
              <g
                className="boat-paddle"
                style={{ "--side": -1, transformOrigin: `186px ${y + 15}px` }}
              >
                <line
                  className="sx sx--dim"
                  data-draw={460 + i * 45}
                  x1="186"
                  y1={y + 15}
                  x2="216"
                  y2={y + 29}
                />
                <ellipse
                  className="sx sx--dim"
                  data-draw={500 + i * 45}
                  cx="220"
                  cy={y + 31}
                  rx="4"
                  ry="8"
                  transform={`rotate(60 220 ${y + 31})`}
                />
              </g>
            </g>
          ))}

          {/* Steerer and sweep oar */}
          <circle className="sx" data-draw="880" cx="140" cy="556" r="8" />
          <g className="boat-oar">
            <line
              className="sx"
              data-draw="900"
              x1="146"
              y1="562"
              x2="182"
              y2="634"
            />
            <ellipse
              className="sx"
              data-draw="940"
              cx="186"
              cy="642"
              rx="5"
              ry="12"
              transform="rotate(-27 186 642)"
            />
          </g>

          {/* Wake */}
          <g data-fade="" style={{ "--d": 900 }}>
            <path className="boat-wake" d="M128 626 L112 660" />
            <path className="boat-wake" d="M152 626 L168 660" />
          </g>

          {/* Balloons */}
          <g data-fade="" style={{ "--d": 1100 }}>
            <polyline className="sx sx--dim" points="152,122 236,96" />
            <circle className="sx-balloon" cx="250" cy="92" r="14" />
            <text className="sx-balloon__n" x="250" y="97" textAnchor="middle">
              1
            </text>
          </g>
          <g data-fade="" style={{ "--d": 1160 }}>
            <polyline className="sx sx--dim" points="170,290 236,262" />
            <circle className="sx-balloon" cx="250" cy="256" r="14" />
            <text className="sx-balloon__n" x="250" y="261" textAnchor="middle">
              2
            </text>
          </g>
          <g data-fade="" style={{ "--d": 1220 }}>
            <polyline className="sx sx--dim" points="148,552 236,522" />
            <circle className="sx-balloon" cx="250" cy="516" r="14" />
            <text className="sx-balloon__n" x="250" y="521" textAnchor="middle">
              3
            </text>
          </g>
        </g>
      </motion.g>
    </svg>
  );
}
