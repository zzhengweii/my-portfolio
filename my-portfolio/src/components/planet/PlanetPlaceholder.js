import React from "react";

// Line drawing of the planet shown while the 3D chunk loads, and kept as the
// fallback when WebGL is unavailable. Proportions match the 3D framing.
export default function PlanetPlaceholder({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        className="sx sx--hidden"
        cx="200"
        cy="206"
        rx="178"
        ry="62"
        transform="rotate(-9 200 206)"
      />
      <circle className="sx" cx="200" cy="206" r="104" />
      <ellipse className="sx sx--dim" cx="200" cy="206" rx="104" ry="30" />
      <ellipse className="sx sx--dim" cx="200" cy="206" rx="46" ry="104" />
      <path className="sx sx--dim" d="M110 154 Q200 176 290 154" />
      <path className="sx sx--dim" d="M110 258 Q200 236 290 258" />
      <g className="sx">
        <line x1="200" y1="102" x2="200" y2="86" />
        <circle cx="200" cy="80" r="5" />
      </g>
    </svg>
  );
}
