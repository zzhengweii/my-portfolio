import React, { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll, useVelocity } from "framer-motion";
import { createWorld } from "./world";
import RollText from "../ui/RollText";
import { useTheme } from "../theme";

// Each label rides beside the landmark it names, pushed outwards from the
// planet's centre, with a leader line back to the landmark.
const CALLOUTS = [
  { id: "boat", label: "NUS Dragon Boat", href: "#activities", reach: 78 },
  {
    id: "vessel",
    label: "Vessel eco-speed",
    href: "#projects",
    reach: 64,
  },
  { id: "plane", label: "Contact", href: "#contact", reach: 40 },
];

const SHELF = 14;
const EDGE = 10;
// How far a label may hang past the stage's left edge (into the column gap).
const MAX_BLEED = 32;

export default function PlanetCanvas({ onReady, onFail }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const labels = useRef({});
  const lines = useRef({});
  const dots = useRef({});
  const callbacks = useRef({ onReady, onFail });
  callbacks.current = { onReady, onFail };
  const worldRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Scrolling the page speeds the walker up for a moment.
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  useMotionValueEvent(scrollVelocity, "change", (v) =>
    worldRef.current?.nudge(v),
  );

  useEffect(() => {
    worldRef.current?.setDay(theme === "day");
  }, [theme]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sizes = {};
    const placed = {};
    let box = { w: 1, h: 1 };
    let bleed = 0;
    let firstFrame = true;

    const measure = () => {
      box = { w: wrap.clientWidth, h: wrap.clientHeight };
      // Only bleed into space that exists (the gap next to the hero copy).
      bleed = Math.min(
        MAX_BLEED,
        Math.max(0, wrap.getBoundingClientRect().left - 12),
      );
      bleed = bleed > EDGE ? bleed : -EDGE;
      CALLOUTS.forEach(({ id }) => {
        const el = labels.current[id];
        sizes[id] = el ? { w: el.offsetWidth, h: el.offsetHeight } : null;
      });
    };

    const onFrame = (points, centre) => {
      for (const p of points) {
        const spec = CALLOUTS.find((c) => c.id === p.id);
        const size = sizes[p.id];
        const line = lines.current[p.id];
        const dot = dots.current[p.id];
        const label = labels.current[p.id];
        if (!spec || !size || !size.w || !line || !dot || !label) continue;

        let dx = p.x - centre.x;
        let dy = p.y - centre.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        let side = dx >= 0 ? 1 : -1;
        let tx = p.x + dx * spec.reach + side * SHELF;
        const ty = p.y + dy * spec.reach * 0.7;
        let left = side > 0 ? tx : tx - size.w;
        // No room on the outward side: hang the label on the inner side.
        if (left < -bleed || left + size.w > box.w - EDGE) {
          side = -side;
          tx = p.x + side * (SHELF + 20);
          left = side > 0 ? tx : tx - size.w;
        }
        const target = {
          x: Math.min(box.w - size.w - EDGE, Math.max(-bleed, left)),
          y: Math.min(box.h - size.h - EDGE, Math.max(EDGE, ty - size.h / 2)),
        };
        const prev = placed[p.id] || target;
        const next = firstFrame
          ? target
          : {
              x: prev.x + (target.x - prev.x) * 0.18,
              y: prev.y + (target.y - prev.y) * 0.18,
            };
        placed[p.id] = next;

        // Leader: landmark -> elbow -> short shelf into the label's edge.
        const edgeX = side > 0 ? next.x : next.x + size.w;
        const midY = next.y + size.h / 2;
        const elbowX = edgeX - side * SHELF;
        line.setAttribute(
          "points",
          `${p.x.toFixed(1)},${p.y.toFixed(1)} ${elbowX.toFixed(1)},${midY.toFixed(1)} ${edgeX.toFixed(1)},${midY.toFixed(1)}`,
        );
        dot.setAttribute("cx", p.x.toFixed(1));
        dot.setAttribute("cy", p.y.toFixed(1));
        const vis = String(p.visible);
        line.style.opacity = vis;
        dot.style.opacity = vis;
        label.style.opacity = vis;
        label.style.transform = `translate3d(${next.x.toFixed(1)}px, ${next.y.toFixed(1)}px, 0)`;
        const hidden = p.visible < 0.35;
        if (label.dataset.hidden !== String(hidden)) {
          label.dataset.hidden = String(hidden);
          label.tabIndex = hidden ? -1 : 0;
        }
      }
      if (firstFrame) {
        firstFrame = false;
        callbacks.current.onReady?.();
      }
    };

    let world;
    try {
      world = createWorld(canvas, {
        reducedMotion,
        onFrame,
        day: themeRef.current === "day",
      });
      worldRef.current = world;
    } catch (error) {
      callbacks.current.onFail?.();
      return undefined;
    }

    const sizeToBox = () => {
      measure();
      world.resize(box.w, box.h);
    };
    const ro = new ResizeObserver(sizeToBox);
    ro.observe(wrap);
    sizeToBox();

    // Hovering or focusing a label brings the world to a gentle stop.
    const pause = () => world.setPaused(true);
    const resume = () => world.setPaused(false);
    const labelEls = Object.values(labels.current).filter(Boolean);
    labelEls.forEach((el) => {
      el.addEventListener("pointerenter", pause);
      el.addEventListener("pointerleave", resume);
      el.addEventListener("focus", pause);
      el.addEventListener("blur", resume);
    });

    // Only animate while the hero is on screen and the tab is visible.
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !document.hidden) world.start();
      else world.stop();
    });
    io.observe(wrap);
    const onVisibility = () => {
      if (document.hidden) world.stop();
      else if (onScreen) world.start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onLost = (e) => {
      e.preventDefault();
      callbacks.current.onFail?.();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      ro.disconnect();
      io.disconnect();
      labelEls.forEach((el) => {
        el.removeEventListener("pointerenter", pause);
        el.removeEventListener("pointerleave", resume);
        el.removeEventListener("focus", pause);
        el.removeEventListener("blur", resume);
      });
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      worldRef.current = null;
      world.dispose();
    };
  }, []);

  return (
    <div className="world__stage" ref={wrapRef}>
      <canvas ref={canvasRef} className="world__canvas" aria-hidden="true" />
      <svg className="world__leaders" aria-hidden="true">
        {CALLOUTS.map(({ id }) => (
          <g key={id}>
            <polyline
              ref={(el) => {
                lines.current[id] = el;
              }}
              className="world__leader"
              points="0,0"
            />
            <circle
              ref={(el) => {
                dots.current[id] = el;
              }}
              className="world__anchor"
              r="3.5"
              cx="-10"
              cy="-10"
            />
          </g>
        ))}
      </svg>
      <nav className="world__labels" aria-label="Places on the planet">
        {CALLOUTS.map(({ id, label, href }) => (
          <a
            key={id}
            ref={(el) => {
              labels.current[id] = el;
            }}
            className="world__label"
            href={href}
          >
            <RollText>{label}</RollText>
          </a>
        ))}
      </nav>
    </div>
  );
}
