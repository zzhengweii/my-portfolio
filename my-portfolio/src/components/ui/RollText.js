import React from "react";
import "./ui.css";

/*
 * Hover text roll: each character slides up and an identical copy slides in
 * from below, staggered left to right. Screen readers get the plain label.
 * Triggered by hovering (or keyboard-focusing) the closest link or button.
 */
export default function RollText({ children, className = "" }) {
  const text = String(children);
  return (
    <span className={`roll ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="roll__track" aria-hidden="true">
        {Array.from(text).map((char, i) => {
          const glyph = char === " " ? " " : char;
          return (
            <span
              key={i}
              className="roll__char"
              data-char={glyph}
              style={{ "--i": i }}
            >
              {glyph}
            </span>
          );
        })}
      </span>
    </span>
  );
}
