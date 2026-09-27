import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { PiList, PiMoon, PiSun, PiX } from "react-icons/pi";
import { navItems } from "../data/content";
import RollText from "./ui/RollText";
import { EASE_OUT } from "./ui/motion";
import { useTheme } from "./theme";
import "./Nav.css";

function useActiveSection() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const ids = ["home", ...navItems.map((item) => item.id)];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, []);
  return active;
}

// Sun at night (switch to day), moon by day. The new theme grows out of
// the button as a circle.
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();
  const isDay = theme === "day";
  const hidden = reduce
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.4, rotate: 90, filter: "blur(4px)" };

  const onClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <button
      type="button"
      className="nav__theme"
      aria-label="Day mode"
      aria-pressed={isDay}
      onClick={onClick}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={theme}
          className="nav__theme-icon"
          initial={hidden}
          animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
          exit={{ ...hidden, rotate: reduce ? 0 : -90 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0 }}
        >
          {isDay ? <PiMoon aria-hidden="true" /> : <PiSun aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const lastY = useRef(0);
  const menuButton = useRef(null);
  const header = useRef(null);
  const idle = useRef(0);

  // Hide while scrolling down, return on the way up. Away from the top of
  // the page it also tucks itself away after a pause in scrolling, unless
  // it is being pointed at or has keyboard focus.
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = lastY.current;
    lastY.current = y;
    if (y < 120) setHidden(false);
    else if (y > previous + 6) setHidden(true);
    else if (y < previous - 6) setHidden(false);

    window.clearTimeout(idle.current);
    if (y >= 120) {
      idle.current = window.setTimeout(() => {
        const el = header.current;
        if (el && !el.matches(":hover, :focus-within")) setHidden(true);
      }, 2500);
    }
  });

  useEffect(() => () => window.clearTimeout(idle.current), []);

  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      ref={header}
      className={`nav${hidden && !open ? " is-hidden" : ""}`}
    >
      <div className="container nav__inner">
        <a
          href="#home"
          className="nav__brand"
          aria-label="Zheng Wei Ow, back to top"
        >
          Z<span aria-hidden="true">/</span>W
        </a>

        <div className="nav__actions">
          <nav className="nav__pill" aria-label="Primary">
            <ul>
              {navItems.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={isActive ? "is-active" : undefined}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="nav__indicator"
                          transition={
                            reduce
                              ? { duration: 0 }
                              : { type: "spring", duration: 0.45, bounce: 0.12 }
                          }
                        />
                      )}
                      <RollText>{item.label}</RollText>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ThemeToggle />

          <button
            ref={menuButton}
            type="button"
            className="nav__menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <PiX aria-hidden="true" /> : <PiList aria-hidden="true" />}
            <span>{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="sheet-menu"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, transform: "translateY(-12px)" }
            }
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    transform: "translateY(-8px)",
                    transition: { duration: 0.16 },
                  }
            }
            transition={{ duration: 0.28, ease: EASE_OUT }}
          >
            <nav aria-label="Mobile">
              <ol>
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={
                      reduce
                        ? false
                        : { opacity: 0, transform: "translateY(14px)" }
                    }
                    animate={{ opacity: 1, transform: "translateY(0px)" }}
                    transition={{
                      duration: 0.36,
                      delay: 0.04 + i * 0.04,
                      ease: EASE_OUT,
                    }}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={active === item.id ? "true" : undefined}
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ol>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
