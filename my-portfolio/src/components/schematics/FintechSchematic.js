import React, { useRef } from "react";
import { useDrawOnView } from "../ui/motion";

// The credit-risk engine as a flow: two feature paths (tabular and text)
// merge into one score. Dashes move along the wires to show data flowing.
const NODES = [
  { id: "req", x: 110, y: 10, w: 140, label: "Checkout request" },
  { id: "tab", x: 10, y: 92, w: 160, label: "Tabular credit data" },
  { id: "txt", x: 190, y: 92, w: 160, label: "Transaction text" },
  { id: "gbm", x: 10, y: 166, w: 160, label: "Credit model" },
  { id: "bert", x: 190, y: 166, w: 160, label: "DistilBERT signals" },
  { id: "fuse", x: 110, y: 248, w: 140, label: "Feature fusion" },
  { id: "score", x: 110, y: 322, w: 140, label: "Risk score" },
  {
    id: "decide",
    x: 100,
    y: 396,
    w: 160,
    label: "Instant decision",
    accent: true,
  },
];

const WIRES = [
  "M180 44 V66 H90 V92",
  "M180 44 V66 H270 V92",
  "M90 126 V166",
  "M270 126 V166",
  "M90 200 V222 H180 V248",
  "M270 200 V222 H180 V248",
  "M180 282 V322",
  "M180 356 V396",
];

export default function FintechSchematic() {
  const ref = useRef(null);
  const drawn = useDrawOnView(ref, { amount: 0.3 });
  return (
    <svg
      ref={ref}
      className={`schematic schematic--flow draw${drawn ? " is-drawn" : ""}`}
      viewBox="0 0 360 440"
      role="img"
      aria-label="Flow of the credit-risk engine: a checkout request splits into tabular credit data scored by a credit model and transaction text encoded by DistilBERT; the two merge into a risk score and an instant decision."
    >
      {WIRES.map((d, i) => (
        <g key={d}>
          <path className="sx sx--dim" data-draw={i * 90} d={d} />
          <path className="sx-flow" d={d} data-fade="" style={{ "--d": 900 }} />
        </g>
      ))}
      {NODES.map((n, i) => (
        <g key={n.id} data-fade="" style={{ "--d": 150 + i * 90 }}>
          <rect
            className={n.accent ? "sx-box sx-box--accent" : "sx-box"}
            x={n.x}
            y={n.y}
            width={n.w}
            height="34"
            rx="8"
          />
          <text
            className="sx-box__text"
            x={n.x + n.w / 2}
            y={n.y + 21.5}
            textAnchor="middle"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
