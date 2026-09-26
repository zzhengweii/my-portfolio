import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

export const EASE_OUT = [0.23, 1, 0.32, 1];

export function useMediaQuery(query) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

// Fade and rise once when scrolled into view. Uses a transform string so the
// animation can run on the compositor.
export function Reveal({
  as = "div",
  delay = 0,
  y = 24,
  className,
  children,
  ...rest
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, transform: `translateY(${y}px)` }}
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/*
 * Scroll-linked drift for parallax depth. `distance` is how far (px) the
 * element travels over its whole pass through the viewport: positive drifts
 * up faster than the page (feels closer), negative lags behind (feels
 * further away). Halved on small screens, off with reduced motion.
 */
export function useParallax(
  ref,
  distance,
  offset = ["start end", "end start"],
) {
  const reduce = useReducedMotion();
  const small = useMediaQuery("(max-width: 700px)");
  const reach = useRef(distance);
  reach.current = reduce ? 0 : small ? distance / 2 : distance;
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return useTransform(scrollYProgress, (v) => (1 - 2 * v) * reach.current);
}

export function Parallax({
  as = "div",
  distance = 32,
  className,
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const y = useParallax(ref, distance);
  const Tag = motion[as];
  return (
    <Tag ref={ref} className={className} style={{ ...style, y }} {...rest}>
      {children}
    </Tag>
  );
}

// Gentle pull towards the cursor, on precise pointers only.
export function Magnetic({ children, strength = 0.22 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 240, damping: 18, mass: 0.5 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className="magnetic"
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.span>
  );
}

/*
 * Draws [data-draw] strokes of an SVG once it scrolls into view. Lengths are
 * measured in screen pixels because the strokes use non-scaling-stroke, where
 * Chromium ignores pathLength. data-draw="120" delays that stroke by 120ms.
 */
export function useDrawOnView(ref, { amount = 0.35 } = {}) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setDrawn(true);
      return undefined;
    }
    const strokes = Array.from(root.querySelectorAll("[data-draw]"));
    let done = false;
    let timer = 0;

    const prime = () => {
      strokes.forEach((el) => {
        const ctm = el.getScreenCTM();
        const scale = ctm ? Math.hypot(ctm.a, ctm.b) : 1;
        const len = (el.getTotalLength ? el.getTotalLength() : 0) * scale + 2;
        el.style.transition = "none";
        el.style.strokeDasharray = `${len} ${len}`;
        el.style.strokeDashoffset = `${len}`;
      });
    };

    const clear = () => {
      strokes.forEach((el) => {
        el.style.transition = "";
        el.style.strokeDasharray = "";
        el.style.strokeDashoffset = "";
      });
    };

    prime();
    const onResize = () => {
      if (!done) prime();
    };
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        done = true;
        prime();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setDrawn(true);
            let longest = 0;
            strokes.forEach((el) => {
              const delay = Number(el.dataset.draw) || 0;
              longest = Math.max(longest, delay);
              el.style.transition = `stroke-dashoffset 1500ms cubic-bezier(0.65, 0, 0.35, 1) ${delay}ms`;
              el.style.strokeDashoffset = "0";
            });
            timer = window.setTimeout(clear, longest + 1600);
          });
        });
      },
      { threshold: amount },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, [ref, amount]);
  return drawn;
}
