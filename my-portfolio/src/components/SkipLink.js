import React, { useEffect, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

/*
 * "Skip to content". On desktop it only appears on keyboard focus. On
 * tablets and phones it floats bottom right like the nav: it slips away
 * while you scroll down and comes back when you scroll up or pause.
 */
export default function SkipLink() {
  const { scrollY } = useScroll();
  const [away, setAway] = useState(false);
  const [last, setLast] = useState(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (y > last + 6) setAway(true);
    else if (y < last - 6) setAway(false);
    setLast(y);
  });

  // Back after the page has been still for a moment.
  useEffect(() => {
    if (!away) return undefined;
    const timer = window.setTimeout(() => setAway(false), 900);
    return () => window.clearTimeout(timer);
  }, [away, last]);

  return (
    <a className={`skip-link${away ? " is-away" : ""}`} href="#main">
      Skip to content
    </a>
  );
}
