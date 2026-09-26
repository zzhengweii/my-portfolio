import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

// Where "Skip to content" lands: past the hero, at the first section.
const TARGET = "about";

/*
 * "Skip to content". On desktop it only appears on keyboard focus. On
 * tablets and phones it floats bottom right: it shows when you scroll up
 * (and on arrival), slips away while you scroll down, and tucks itself
 * away again after a couple of seconds of stillness.
 */
export default function SkipLink() {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(true);
  const last = useRef(0);
  const idle = useRef(0);
  // Ignore the scroll our own jump causes.
  const jumping = useRef(false);

  const hideSoon = () => {
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setShown(false), 2400);
  };

  useEffect(() => {
    hideSoon();
    return () => window.clearTimeout(idle.current);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (jumping.current) {
      last.current = y;
      return;
    }
    if (y < last.current - 6) {
      setShown(true);
      hideSoon();
    } else if (y > last.current + 6) {
      setShown(false);
    }
    last.current = y;
  });

  const skip = (e) => {
    const target = document.getElementById(TARGET);
    if (!target) return;
    e.preventDefault();
    jumping.current = true;
    window.setTimeout(() => {
      jumping.current = false;
    }, 1200);
    target.scrollIntoView({ block: "start" });
    // Move focus too, so keyboard and screen reader users land there.
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    window.history.replaceState(null, "", `#${TARGET}`);
    setShown(false);
  };

  return (
    <a
      className={`skip-link${shown ? "" : " is-away"}`}
      href={`#${TARGET}`}
      onClick={skip}
    >
      Skip to content
    </a>
  );
}
