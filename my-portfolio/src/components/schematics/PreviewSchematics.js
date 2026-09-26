import React from "react";

// Compact diagrams used as project previews where no screenshot exists.

function Box({ x, y, w, h = 30, label, accent = false }) {
  return (
    <g>
      <rect
        className={accent ? "sx-box sx-box--accent" : "sx-box"}
        x={x}
        y={y}
        width={w}
        height={h}
        rx="7"
      />
      <text
        className="sx-box__text"
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

export function FraudPreview() {
  return (
    <svg
      className="schematic schematic--preview"
      viewBox="0 0 320 240"
      aria-hidden="true"
    >
      <path
        className="sx sx--dim"
        d="M96 52 H116 V120 H136 M96 120 H136 M96 188 H116 V120"
      />
      <path
        className="sx sx--dim"
        d="M216 120 H228 V58 H244 M228 120 H244 M228 120 V182 H244"
      />
      <path className="sx sx--hidden" d="M176 136 V178" />
      <Box x={14} y={37} w={82} label="PaySim" />
      <Box x={14} y={105} w={82} label="BAF" />
      <Box x={14} y={173} w={82} label="IEEE-CIS" />
      <Box x={136} y={104} w={80} h={32} label="FastAPI" />
      <Box x={136} y={178} w={80} label="GPT-4o" />
      <Box x={244} y={43} w={62} label="Pass" />
      <Box x={244} y={105} w={62} label="Review" />
      <Box x={244} y={167} w={62} label="Block" accent />
    </svg>
  );
}

export function HealthcarePreview() {
  return (
    <svg
      className="schematic schematic--preview"
      viewBox="0 0 320 240"
      aria-hidden="true"
    >
      <path
        className="sx sx--dim"
        d="M152 51 H168 M234 66 V83 H85 V100 M85 132 V172 M150 187 H170"
      />
      <Box x={20} y={36} w={132} label="550K+ claims" />
      <Box x={168} y={36} w={132} label="138 features" />
      <Box x={20} y={100} w={280} h={32} label="6 models, Optuna tuning" />
      <Box x={20} y={172} w={130} label="Extra Trees" />
      <Box x={170} y={172} w={130} label="94.61% ROC-AUC" accent />
    </svg>
  );
}
