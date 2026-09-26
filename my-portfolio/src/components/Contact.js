import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
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
import { EASE_OUT, Reveal, useMediaQuery } from "./ui/motion";
import "./Contact.css";

const COPY_STATES = {
  idle: { icon: PiCopy, label: "Copy" },
  copied: { icon: PiCheck, label: "Copied" },
  error: { icon: PiWarningCircle, label: "Copy failed" },
};

function CopyButton({ text, onCopied }) {
  const [state, setState] = useState("idle");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      onCopied?.();
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

function Stamp({ style, ref }) {
  return (
    <motion.div ref={ref} className="stamp" aria-hidden="true" style={style}>
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

// A point, and the slope, along one axis of a cubic Bezier.
const bezier = ([a, b, c, d], t) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};
const slope = ([a, b, c, d], t) => {
  const u = 1 - t;
  return 3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c);
};

/*
 * Sending the message: a paper plane takes off from the email address and
 * flies an arc into the stamp, drawing a dashed trail behind it. The route
 * is measured from the live layout at every launch, so it fits any screen.
 */
function PaperPlane({ cardRef, fromRef, toRef, active, trigger, onArrive }) {
  const route = useRef(null);
  const busy = useRef(false);
  const [trail, setTrail] = useState(null);
  const progress = useMotionValue(0);
  const trailOpacity = useMotionValue(0);
  const x = useTransform(progress, (t) =>
    route.current ? bezier(route.current.x, t) : -99,
  );
  const y = useTransform(progress, (t) =>
    route.current ? bezier(route.current.y, t) : -99,
  );
  const rotate = useTransform(progress, (t) => {
    const r = route.current;
    return r ? (Math.atan2(slope(r.y, t), slope(r.x, t)) * 180) / Math.PI : 0;
  });
  const opacity = useTransform(progress, [0, 0.06, 0.86, 1], [0, 1, 1, 0]);
  const scale = useTransform(progress, [0, 0.1, 0.8, 1], [0.5, 1, 1, 0.35]);

  const launch = useCallback(async () => {
    const card = cardRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (busy.current || !card || !from || !to) return;
    busy.current = true;
    const c = card.getBoundingClientRect();
    const f = from.getBoundingClientRect();
    const s = to.getBoundingClientRect();
    const x0 = f.left - c.left + 8;
    const y0 = f.top - c.top - 10;
    const x3 = s.left - c.left + s.width / 2;
    const y3 = s.top - c.top + s.height / 2;
    // Taxi off the address almost level, then turn and climb (or dive, on
    // narrow screens where the stamp sits below) into the stamp.
    const dx = x3 - x0;
    const r = {
      x: [x0, x0 + dx * 0.45, x3 - dx * 0.08, x3],
      y: [y0, y0 - 6, y3 + (y0 - y3) * 0.85, y3],
    };
    route.current = r;
    setTrail({
      w: c.width,
      h: c.height,
      d: `M${r.x[0]} ${r.y[0]} C${r.x[1]} ${r.y[1]} ${r.x[2]} ${r.y[2]} ${r.x[3]} ${r.y[3]}`,
    });
    progress.jump(0);
    trailOpacity.jump(1);
    await animate(progress, 1, { duration: 1.8, ease: [0.45, 0.05, 0.3, 1] });
    onArrive();
    await animate(trailOpacity, 0, { duration: 0.8, ease: "easeOut" });
    busy.current = false;
  }, [cardRef, fromRef, toRef, onArrive, progress, trailOpacity]);

  // One every few seconds while the card is on screen.
  useEffect(() => {
    if (!active) return undefined;
    let stopped = false;
    let timer = 0;
    const loop = async () => {
      await launch();
      if (!stopped) timer = window.setTimeout(loop, 4600);
    };
    timer = window.setTimeout(loop, 1100);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [active, launch]);

  // Copying the address, or pointing at it, sends one straight away.
  useEffect(() => {
    if (trigger && active) launch();
  }, [trigger, active, launch]);

  return (
    <div className="flight" aria-hidden="true">
      {trail && (
        <svg
          className="flight__trail"
          width={trail.w}
          height={trail.h}
          viewBox={`0 0 ${trail.w} ${trail.h}`}
        >
          <defs>
            <mask
              id="flight-reveal"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={trail.w}
              height={trail.h}
            >
              <motion.path
                className="flight__reveal"
                d={trail.d}
                style={{ pathLength: progress }}
              />
            </mask>
          </defs>
          <motion.path
            className="flight__path"
            d={trail.d}
            mask="url(#flight-reveal)"
            style={{ opacity: trailOpacity }}
          />
        </svg>
      )}
      <motion.div
        className="flight__plane"
        style={{ x, y, rotate, opacity, scale }}
      >
        <svg viewBox="-13 -9 26 18">
          <path className="flight__wing" d="M-12 -8 L12 0 L-12 8 L-6 0 Z" />
          <path className="flight__fold" d="M-6 0 L12 0" />
        </svg>
      </motion.div>
    </div>
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
  const cardRef = useRef(null);
  const marksRef = useRef(null);
  const emailRef = useRef(null);
  const stampRef = useRef(null);
  const reduce = useReducedMotion();
  // Once the card is in view the stamp lands and gets franked. After that,
  // while the card is on screen, messages fly from the address to the stamp.
  const seen = useInView(marksRef, { once: true, amount: 0.6 });
  const onScreen = useInView(cardRef, { amount: 0.35 });
  const live = seen && onScreen && !reduce;
  const [sendTick, setSendTick] = useState(0);
  const send = () => setSendTick((n) => n + 1);
  // On arrival the stamp jumps and the postmark thumps down again.
  const stampThump = useMotionValue(1);
  const markThump = useMotionValue(1);
  const onArrive = useCallback(() => {
    animate(stampThump, [1.14, 1], { duration: 0.5, ease: [0.2, 1.4, 0.4, 1] });
    animate(markThump, [1, 1.16, 1], {
      duration: 0.5,
      delay: 0.06,
      ease: "easeOut",
    });
  }, [stampThump, markThump]);
  const small = useMediaQuery("(max-width: 700px)");
  // The stamp and postmark sit at different depths on the card.
  const { scrollYProgress } = useScroll({
    target: marksRef,
    offset: ["start end", "end start"],
  });
  const k = reduce ? 0 : small ? 0.6 : 1;
  const stampY = useTransform(scrollYProgress, (v) => (0.5 - v) * 64 * k);
  const stampRotate = useTransform(
    scrollYProgress,
    (v) => 3 + (v - 0.5) * -12 * k,
  );
  const markY = useTransform(scrollYProgress, (v) => (0.5 - v) * -60 * k);
  const markRotate = useTransform(
    scrollYProgress,
    (v) => -9 + (v - 0.5) * 14 * k,
  );

  return (
    <section
      id="contact"
      className="section contact"
      aria-labelledby="contact-title"
    >
      <div className="container">
        <Reveal
          as="article"
          ref={cardRef}
          className={`postcard${live ? " is-live" : ""}`}
        >
          <div className="postcard__message">
            <h2 id="contact-title" className="postcard__title">
              Send me a message
            </h2>
            <p className="postcard__text">
              Always happy to talk about data science, machine learning or
              anything {":) "}.
            </p>
            <div className="postcard__email">
              <a
                ref={emailRef}
                href={`mailto:${links.email}`}
                className="postcard__address-link"
                onPointerEnter={(e) => e.pointerType === "mouse" && send()}
              >
                {links.email}
              </a>
              <CopyButton text={links.email} onCopied={send} />
            </div>
          </div>

          <div className="postcard__side">
            <div
              ref={marksRef}
              className={`postcard__marks${seen || reduce ? " is-seen" : ""}`}
            >
              <Postmark
                style={{ y: markY, rotate: markRotate, scale: markThump }}
              />
              <Stamp
                ref={stampRef}
                style={{ y: stampY, rotate: stampRotate, scale: stampThump }}
              />
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

          {!reduce && (
            <PaperPlane
              cardRef={cardRef}
              fromRef={emailRef}
              toRef={stampRef}
              active={live}
              trigger={sendTick}
              onArrive={onArrive}
            />
          )}
        </Reveal>

        <footer className="footer">
          <p>&copy; 2026 Ow Zheng Wei</p>
          <a href="#home" className="footer__top">
            <RollText>Back to top</RollText>
            <PiArrowUp aria-hidden="true" />
          </a>
        </footer>
      </div>
    </section>
  );
}
