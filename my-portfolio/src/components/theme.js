import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { flushSync } from "react-dom";

// Night is the default look; day is an opt-in light theme. The choice is
// applied as <html data-theme="..."> (set before first paint by a small
// script in index.html) and remembered in localStorage.
const THEME_COLORS = { night: "#0C0D0D", day: "#F4EEE8" };

const ThemeContext = createContext({ theme: "night", toggle: () => {} });

function readTheme() {
  return document.documentElement.dataset.theme === "day" ? "day" : "night";
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "day" ? "light" : "dark";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // Private mode or blocked storage: the theme still applies for this visit.
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // origin: the point (in viewport px) the new theme grows out from.
  const toggle = useCallback(
    (origin) => {
      const next = theme === "day" ? "night" : "day";
      const swap = () => {
        flushSync(() => setTheme(next));
        applyTheme(next);
      };
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!document.startViewTransition || reduce) {
        swap();
        return;
      }
      const transition = document.startViewTransition(swap);
      if (!origin) return;
      transition.ready.then(() => {
        const { x, y } = origin;
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 700,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
    },
    [theme],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
