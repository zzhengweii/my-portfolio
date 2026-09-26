import React, { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useDrawOnView } from "../ui/motion";
import "./VesselSchematic.css";

// Side elevation of a container vessel with the signals the eco-speed model
// reads. Balloon numbers match VESSEL_PARTS, which the sheet lists in HTML.
export const VESSEL_PARTS = [
  "Shaft RPM",
  "Engine RPM",
  "Fuel consumption, L/hr",
  "Speed and heading",
  "Wind, waves and current forecast",
];

// What each signal is, shown in the sheet's readout.
export const VESSEL_NOTES = [
  "How fast the propeller shaft turns. Read at the shaft, it links engine effort to speed through the water.",
  "Main engine speed. Fuel burn climbs steeply as the engine works harder.",
  "Fuel flow into the engine, in litres per hour. This is the value the model predicts.",
  "Speed over ground and course, from the ship's GPS on the mast.",
  "Weather along the route. Head winds, waves and currents add resistance, so the same speed costs more fuel.",
];

const CONTAINERS = (() => {
  const boxes = [];
  const tiers = [
    { y: 204, from: 392, to: 972 },
    { y: 184, from: 392, to: 972 },
    { y: 164, from: 432, to: 932 },
  ];
  tiers.forEach((tier, t) => {
    for (let x = tier.from, i = 0; x + 38 <= tier.to + 1; x += 40, i++) {
      boxes.push({
        x,
        y: tier.y,
        key: `${t}-${i}`,
        delay: 520 + t * 90 + i * 22,
      });
    }
  });
  return boxes;
})();

// Sensor position, balloon position and delay for each signal, in order.
const SIGNALS = [
  { sensor: [222, 330], balloon: [170, 412], from: [218, 335], delay: 1150 },
  { sensor: [305, 300], balloon: [305, 412], from: [305, 306], delay: 1100 },
  { sensor: [376, 300], balloon: [440, 412], from: [380, 306], delay: 1200 },
  { sensor: [340, 54], balloon: [420, 38], from: [346, 52], delay: 1250 },
  { sensor: [1100, 98], balloon: [1100, 36], from: [1100, 92], delay: 1300 },
];

/*
 * One signal: sensor node, leader and numbered balloon, with generous hit
 * areas. Pointer only: the SVG is a single image to assistive tech, and the
 * sheet's list of buttons offers the same choices to keyboards and readers.
 */
function Signal({ index, active, onHover, onPick }) {
  const { sensor, balloon, from, delay } = SIGNALS[index];
  const [sx, sy] = sensor;
  const [bx, by] = balloon;
  const [fx, fy] = from;
  return (
    <g
      className={`signal${active === index ? " is-active" : ""}`}
      style={{ "--i": index }}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(index)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onHover(null)}
      onClick={() => onPick(index)}
    >
      <g data-fade="" style={{ "--d": delay + 100 }}>
        <polyline
          className="signal__leader"
          points={`${fx},${fy} ${bx},${by}`}
        />
        <circle className="signal__balloon" cx={bx} cy={by} r="15" />
        <text className="signal__n" x={bx} y={by + 5} textAnchor="middle">
          {index + 1}
        </text>
      </g>
      <g data-fade="" style={{ "--d": delay }}>
        <circle className="signal__pulse" cx={sx} cy={sy} r="6" />
        <circle className="signal__node" cx={sx} cy={sy} r="6" />
        <circle className="signal__dot" cx={sx} cy={sy} r="2" />
      </g>
      <circle className="signal__hit" cx={bx} cy={by} r="34" />
      <circle className="signal__hit" cx={sx} cy={sy} r="30" />
    </g>
  );
}

export default function VesselSchematic({
  active = null,
  onHover = () => {},
  onPick = () => {},
}) {
  const ref = useRef(null);
  const drawn = useDrawOnView(ref);
  const playing = useInView(ref, { amount: 0.05 });
  const reduce = useReducedMotion();
  // Parallax: the ship sails a little way along the sheet as the page scrolls.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const sail = useTransform(scrollYProgress, (v) =>
    reduce ? 0 : (v - 0.5) * 110,
  );

  return (
    <svg
      ref={ref}
      className={`schematic schematic--vessel draw${drawn ? " is-drawn" : ""}${playing ? " is-playing" : ""}`}
      data-active={active === null ? undefined : active}
      viewBox="0 0 1200 440"
      role="img"
      aria-label="Side elevation of a container vessel, with sensors on the engine, propeller shaft, fuel line and mast, and weather arrows at the bow."
    >
      {/* Waterline (it streams astern while she is under way), waves and current */}
      <line
        className="sx sx--hidden vx-waterline"
        x1="40"
        y1="292"
        x2="1160"
        y2="292"
        data-fade=""
      />
      <g className="vx vx--sea" data-fade="" style={{ "--d": 900 }}>
        <path
          className="sx sx--dim vx-wave"
          d="M1058 300 q10 -8 20 0 t20 0 t20 0 t20 0"
        />
        <path
          className="sx sx--dim vx-current"
          d="M1150 334 H1070 m10 -6 l-10 6 l10 6"
        />
      </g>

      {/* Wind from the bow quarter */}
      <g className="vx vx--wind" data-fade="" style={{ "--d": 1000 }}>
        <path className="sx sx--dim" d="M1150 78 H1040 m10 -6 l-10 6 l10 6" />
        <path className="sx sx--dim" d="M1130 98 H1060 m10 -6 l-10 6 l10 6" />
        <path className="sx sx--dim" d="M1150 118 H1070 m10 -6 l-10 6 l10 6" />
      </g>

      <motion.g style={{ x: sail }}>
        <g className="vessel-bob">
          {/* Shell: hull, superstructure and cargo. Fades back for x-ray. */}
          <g className="vessel-shell">
            <path
              className="sx"
              data-draw="0"
              d="M196 220 C480 228 820 226 1044 206 L1004 318 C1032 322 1040 344 1016 352 C1000 358 986 356 978 352 L262 352 C222 350 204 330 200 298 Z"
            />
            <path
              className="sx sx--dim"
              data-draw="200"
              d="M206 232 C480 240 820 238 1030 220"
            />

            {/* Accommodation block, bridge and funnel */}
            <rect
              className="sx"
              data-draw="300"
              x="226"
              y="130"
              width="124"
              height="94"
            />
            <rect
              className="sx"
              data-draw="360"
              x="212"
              y="112"
              width="152"
              height="18"
            />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <rect
                key={i}
                className="sx sx--dim"
                data-draw={420 + i * 20}
                x={220 + i * 14}
                y="116"
                width="9"
                height="9"
              />
            ))}
            {[150, 172, 194].map((y) =>
              [244, 262, 280, 298, 316, 334].map((x) => (
                <circle
                  key={`${x}-${y}`}
                  className="sx sx--dim"
                  data-draw={520}
                  cx={x}
                  cy={y}
                  r="3"
                />
              )),
            )}
            <path
              className="sx"
              data-draw="380"
              d="M270 112 L278 74 L316 74 L320 112"
            />
            <line
              className="sx sx--dim"
              data-draw="440"
              x1="276"
              y1="84"
              x2="318"
              y2="84"
            />

            {/* Containers */}
            {CONTAINERS.map((c) => (
              <rect
                key={c.key}
                className="sx sx--dim"
                data-draw={c.delay}
                x={c.x}
                y={c.y}
                width="38"
                height="20"
              />
            ))}
          </g>

          {/* Under way: funnel smoke and propeller wash drift astern */}
          <g data-fade="" style={{ "--d": 800 }}>
            {[0, 1, 2].map((i) => (
              <circle
                key={`puff-${i}`}
                className="vessel-puff"
                cx="297"
                cy="64"
                r="6"
                style={{ "--i": i }}
              />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={`bubble-${i}`}
                className="vessel-bubble"
                cx="154"
                cy={322 + (i % 2) * 14}
                r="2.6"
                style={{ "--i": i }}
              />
            ))}
          </g>

          {/* Mast, with the GPS antenna's signal */}
          <line
            className="sx"
            data-draw="460"
            x1="340"
            y1="112"
            x2="340"
            y2="58"
          />
          <line
            className="sx"
            data-draw="500"
            x1="328"
            y1="70"
            x2="352"
            y2="70"
          />
          <g className="vx vx--gps">
            <path className="vx-arc" d="M330 40 A14 14 0 0 1 350 40" />
            <path className="vx-arc" d="M324 32 A22 22 0 0 1 356 32" />
            <path className="vx-arc" d="M318 24 A30 30 0 0 1 362 24" />
            <path className="vx-heading" d="M1062 262 H1148" />
            <path
              className="vx-heading-head"
              d="M1140 256 L1150 262 L1140 268"
            />
          </g>

          {/* Internals, drawn hidden (dashed) until a signal is traced */}
          <g data-fade="" style={{ "--d": 700 }}>
            <g className="vx vx--engine">
              <rect
                className="sx sx--hidden vx-part"
                x="250"
                y="266"
                width="110"
                height="70"
              />
              {[262, 296, 330].map((x, i) => (
                <rect
                  key={x}
                  className="vx-piston"
                  x={x}
                  y="270"
                  width="18"
                  height="14"
                  rx="2"
                  style={{ "--i": i }}
                />
              ))}
            </g>
            <g className="vx vx--fuel">
              <rect
                className="sx sx--hidden vx-part"
                x="392"
                y="282"
                width="92"
                height="54"
              />
              <rect
                className="vx-level"
                x="397"
                y="304"
                width="82"
                height="27"
              />
              <line
                className="sx sx--hidden vx-part"
                x1="392"
                y1="300"
                x2="360"
                y2="300"
              />
              <line className="vx-flow" x1="392" y1="300" x2="360" y2="300" />
            </g>
            <g className="vx vx--shaft">
              <line
                className="sx sx--hidden vx-part"
                x1="250"
                y1="330"
                x2="194"
                y2="330"
              />
              <ellipse
                className="sx vx-prop"
                cx="186"
                cy="330"
                rx="4"
                ry="16"
              />
              <circle className="sx" cx="186" cy="330" r="2.5" />
            </g>
            <path className="sx" d="M174 304 L160 308 L160 348 L174 352" />
          </g>

          {[0, 1, 2, 3].map((i) => (
            <Signal
              key={i}
              index={i}
              active={active}
              onHover={onHover}
              onPick={onPick}
            />
          ))}
        </g>
      </motion.g>

      {/* The forecast is not on the ship, so it stays put while she sails. */}
      <Signal index={4} active={active} onHover={onHover} onPick={onPick} />
    </svg>
  );
}
