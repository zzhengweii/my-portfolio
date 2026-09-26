import React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import "./Sky.css";

// Tile heights of the patterns in Sky.css.
const FAR = 960;
const NEAR = 1200;
const GLOW = 1600;

export default function Sky() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const far = useTransform(scrollY, (v) => (reduce ? 0 : -((v * 0.08) % FAR)));
  const near = useTransform(scrollY, (v) =>
    reduce ? 0 : -((v * 0.24) % NEAR),
  );
  const glow = useTransform(scrollY, (v) => (reduce ? 0 : -((v * 0.4) % GLOW)));
  return (
    <div className="sky" aria-hidden="true">
      <motion.div className="sky__glow" style={{ y: glow }} />
      <motion.div className="sky__layer sky__layer--far" style={{ y: far }} />
      <motion.div className="sky__layer sky__layer--near" style={{ y: near }} />
    </div>
  );
}
