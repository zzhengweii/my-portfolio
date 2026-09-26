import React, { useRef } from "react";
import { useDrawOnView } from "../ui/motion";

// Side elevation of a container vessel with the signals the eco-speed model
// reads. Balloon numbers match VESSEL_PARTS, which the sheet lists in HTML.
export const VESSEL_PARTS = [
  "Shaft RPM",
  "Engine RPM",
  "Fuel consumption, L/hr",
  "Speed and heading",
  "Wind, waves and current forecast",
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

function Balloon({ n, x, y, from, delay }) {
  const [fx, fy] = from;
  return (
    <g data-fade="" style={{ "--d": delay }}>
      <polyline className="sx sx--dim" points={`${fx},${fy} ${x},${y}`} />
      <circle className="sx-balloon" cx={x} cy={y} r="15" />
      <text className="sx-balloon__n" x={x} y={y + 5} textAnchor="middle">
        {n}
      </text>
    </g>
  );
}

function Sensor({ x, y, delay }) {
  return (
    <g data-fade="" style={{ "--d": delay }}>
      <circle className="sx-node" cx={x} cy={y} r="6" />
      <circle className="sx-node__dot" cx={x} cy={y} r="2" />
    </g>
  );
}

export default function VesselSchematic() {
  const ref = useRef(null);
  const drawn = useDrawOnView(ref);
  return (
    <svg
      ref={ref}
      className={`schematic draw${drawn ? " is-drawn" : ""}`}
      viewBox="0 0 1200 440"
      role="img"
      aria-label="Side elevation of a container vessel, with sensors on the engine, propeller shaft, fuel line and mast, and weather arrows at the bow."
    >
      {/* Waterline, waves and current */}
      <line
        className="sx sx--hidden"
        x1="40"
        y1="292"
        x2="1160"
        y2="292"
        data-fade=""
      />
      <g data-fade="" style={{ "--d": 900 }}>
        <path
          className="sx sx--dim"
          d="M1058 300 q10 -8 20 0 t20 0 t20 0 t20 0"
        />
        <path className="sx sx--dim" d="M1150 334 H1070 m10 -6 l-10 6 l10 6" />
      </g>

      {/* Hull */}
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
      <line className="sx" data-draw="460" x1="340" y1="112" x2="340" y2="58" />
      <line className="sx" data-draw="500" x1="328" y1="70" x2="352" y2="70" />

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

      {/* Hidden internals: engine, fuel tank and line, shaft, propeller, rudder */}
      <g data-fade="" style={{ "--d": 700 }}>
        <rect
          className="sx sx--hidden"
          x="250"
          y="266"
          width="110"
          height="70"
        />
        <rect
          className="sx sx--hidden"
          x="392"
          y="282"
          width="92"
          height="54"
        />
        <line className="sx sx--hidden" x1="392" y1="300" x2="360" y2="300" />
        <line className="sx sx--hidden" x1="250" y1="330" x2="194" y2="330" />
        <ellipse className="sx" cx="186" cy="330" rx="4" ry="16" />
        <circle className="sx" cx="186" cy="330" r="2.5" />
        <path className="sx" d="M174 304 L160 308 L160 348 L174 352" />
      </g>

      {/* Wind from the bow quarter */}
      <g data-fade="" style={{ "--d": 1000 }}>
        <path className="sx sx--dim" d="M1150 78 H1040 m10 -6 l-10 6 l10 6" />
        <path className="sx sx--dim" d="M1130 98 H1060 m10 -6 l-10 6 l10 6" />
        <path className="sx sx--dim" d="M1150 118 H1070 m10 -6 l-10 6 l10 6" />
      </g>

      {/* Sensors and balloons */}
      <Sensor x={305} y={300} delay={1100} />
      <Sensor x={222} y={330} delay={1150} />
      <Sensor x={376} y={300} delay={1200} />
      <Sensor x={340} y={54} delay={1250} />
      <Sensor x={1100} y={98} delay={1300} />
      <Balloon n={2} x={305} y={412} from={[305, 306]} delay={1250} />
      <Balloon n={1} x={170} y={412} from={[218, 335]} delay={1200} />
      <Balloon n={3} x={440} y={412} from={[380, 306]} delay={1300} />
      <Balloon n={4} x={420} y={38} from={[346, 52]} delay={1350} />
      <Balloon n={5} x={1100} y={36} from={[1100, 92]} delay={1400} />
    </svg>
  );
}
