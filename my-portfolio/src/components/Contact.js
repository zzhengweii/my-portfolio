import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  PiArrowUp,
  PiArrowUpRight,
  PiCheck,
  PiCopy,
  PiWarningCircle,
} from "react-icons/pi";
import { links } from "../data/content";
import RollText from "./ui/RollText";
import { EASE_OUT, Reveal } from "./ui/motion";
import "./Contact.css";

const COPY_STATES = {
  idle: { icon: PiCopy, label: "Copy" },
  copied: { icon: PiCheck, label: "Copied" },
  error: { icon: PiWarningCircle, label: "Copy failed" },
};

function CopyButton({ text }) {
  const [state, setState] = useState("idle");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch (error) {
      setState("error");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2400);
  };

  const { icon: Icon, label } = COPY_STATES[state];
  return (
    <>
      <button type="button" className={`copy copy--${state}`} onClick={copy}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={state}
            className="copy__inner"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(3px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(3px)" }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            <Icon aria-hidden="true" />
            {label}
          </motion.span>
        </AnimatePresence>
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "copied"
          ? "Email address copied"
          : state === "error"
            ? "Could not copy. Select the address instead."
            : ""}
      </span>
    </>
  );
}

// Perforated edge: notches punched along every side in the card colour.
const HOLES = [
  ...Array.from({ length: 12 }, (_, i) => [4 + i * 8, 0]),
  ...Array.from({ length: 12 }, (_, i) => [4 + i * 8, 116]),
  ...Array.from({ length: 14 }, (_, i) => [0, 6 + i * 8]),
  ...Array.from({ length: 14 }, (_, i) => [96, 6 + i * 8]),
];

function Stamp({ style }) {
  return (
    <motion.div className="stamp" aria-hidden="true" style={style}>
      <svg viewBox="0 0 96 116">
        <rect className="stamp__paper" x="0" y="0" width="96" height="116" />
        {HOLES.map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            className="stamp__hole"
            cx={cx}
            cy={cy}
            r="2.6"
          />
        ))}
        <rect className="stamp__frame" x="7" y="7" width="82" height="102" />
        <ellipse
          className="sx sx--hidden"
          cx="48"
          cy="64"
          rx="38"
          ry="12"
          transform="rotate(-10 48 64)"
        />
        <circle className="sx" cx="48" cy="64" r="22" />
        <path
          className="sx sx--dim"
          d="M28 56 Q48 64 68 56 M28 72 Q48 64 68 72"
        />
        <line className="sx" x1="48" y1="42" x2="48" y2="34" />
        <circle className="sx" cx="48" cy="31" r="3" />
        <path className="stamp__plane" d="M74 30 L86 25 L80 37 L78 32 Z" />
        <text className="stamp__value" x="10" y="20">
          Z/W
        </text>
      </svg>
    </motion.div>
  );
}

function Postmark({ style }) {
  return (
    <motion.svg
      className="postmark"
      viewBox="0 0 200 110"
      aria-hidden="true"
      style={style}
    >
      <defs>
        <path
          id="postmark-ring"
          d="M55 55 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0"
        />
      </defs>
      <circle className="postmark__line" cx="55" cy="55" r="46" />
      <circle className="postmark__line" cx="55" cy="55" r="28" />
      <text className="postmark__text">
        <textPath href="#postmark-ring" startOffset="2%">
          SENT FROM SINGAPORE
        </textPath>
      </text>
      <text className="postmark__year" x="55" y="60" textAnchor="middle">
        2026
      </text>
      <path
        className="postmark__line"
        d="M104 38 q12 -8 24 0 t24 0 t24 0 t24 0"
      />
      <path
        className="postmark__line"
        d="M104 55 q12 -8 24 0 t24 0 t24 0 t24 0"
      />
      <path
        className="postmark__line"
        d="M104 72 q12 -8 24 0 t24 0 t24 0 t24 0"
      />
    </motion.svg>
  );
}

export default function Contact() {
  const marksRef = useRef(null);
  const reduce = useReducedMotion();
  // The stamp and postmark sit at different depths on the card.
  const { scrollYProgress } = useScroll({
    target: marksRef,
    offset: ["start end", "end start"],
  });
  const k = reduce ? 0 : 1;
  const stampY = useTransform(scrollYProgress, (v) => (0.5 - v) * 40 * k);
  const stampRotate = useTransform(
    scrollYProgress,
    (v) => 3 + (v - 0.5) * -8 * k,
  );
  const markY = useTransform(scrollYProgress, (v) => (0.5 - v) * -36 * k);
  const markRotate = useTransform(
    scrollYProgress,
    (v) => -9 + (v - 0.5) * 10 * k,
  );

  return (
    <section
      id="contact"
      className="section contact"
      aria-labelledby="contact-title"
    >
      <div className="container">
        <Reveal as="article" className="postcard">
          <div className="postcard__message">
            <h2 id="contact-title" className="postcard__title">
              Send me a message
            </h2>
            <p className="postcard__text">
              Always happy to talk about data science, machine learning or
              dragon boat.
            </p>
            <div className="postcard__email">
              <a
                href={`mailto:${links.email}`}
                className="postcard__address-link"
              >
                {links.email}
              </a>
              <CopyButton text={links.email} />
            </div>
          </div>

          <div className="postcard__side">
            <div ref={marksRef} className="postcard__marks">
              <Postmark style={{ y: markY, rotate: markRotate }} />
              <Stamp style={{ y: stampY, rotate: stampRotate }} />
            </div>
            <p className="postcard__to label">To</p>
            <ul className="postcard__lines">
              <li>
                <a href={links.linkedin} target="_blank" rel="noreferrer">
                  <RollText>LinkedIn</RollText>
                  <PiArrowUpRight aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={links.github} target="_blank" rel="noreferrer">
                  <RollText>GitHub</RollText>
                  <PiArrowUpRight aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={`mailto:${links.email}`}>
                  <RollText>Email</RollText>
                  <PiArrowUpRight aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </Reveal>

        <footer className="footer">
          <p>&copy; 2026 Zheng Wei Ow</p>
          <a href="#home" className="footer__top">
            <RollText>Back to top</RollText>
            <PiArrowUp aria-hidden="true" />
          </a>
        </footer>
      </div>
    </section>
  );
}
