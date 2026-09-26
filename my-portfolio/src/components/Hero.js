import React, {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { PiArrowDownRight, PiHandGrabbing } from "react-icons/pi";
import PlanetPlaceholder from "./planet/PlanetPlaceholder";
import RollText from "./ui/RollText";
import { Magnetic, useMediaQuery } from "./ui/motion";
import "./Hero.css";

const PlanetCanvas = lazy(() => import("./planet/PlanetCanvas"));

class WorldBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function WorldStage({ style }) {
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  // Let the headline paint first, then fetch the 3D chunk.
  useEffect(() => {
    const idle =
      window.requestIdleCallback || ((cb) => window.setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const id = idle(() => setMount(true), { timeout: 900 });
    return () => cancel(id);
  }, []);

  return (
    <motion.div
      className={`world${ready && !failed ? " is-ready" : ""}`}
      style={style}
    >
      <PlanetPlaceholder className="world__placeholder" />
      {mount && !failed && (
        <WorldBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <PlanetCanvas
              onReady={() => setReady(true)}
              onFail={() => setFailed(true)}
            />
          </Suspense>
        </WorldBoundary>
      )}
      {ready && !failed && (
        <p className="world__hint label">
          <PiHandGrabbing aria-hidden="true" />
          {finePointer ? "Drag to spin" : "Swipe to spin"}
        </p>
      )}
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const stacked = useMediaQuery("(max-width: 960px)");
  // Parallax as the hero scrolls away: the copy lifts off faster than the
  // page and fades, the planet lags behind and recedes.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const k = reduce ? 0 : stacked ? 0.5 : 1;
  const copyY = useTransform(scrollYProgress, (v) => v * -150 * k);
  const copyOpacity = useTransform(scrollYProgress, (v) =>
    reduce ? 1 : Math.max(0, 1 - v * 1.2),
  );
  const worldY = useTransform(scrollYProgress, (v) => v * 220 * k);
  const worldScale = useTransform(scrollYProgress, (v) => 1 - v * 0.12 * k);

  return (
    <section ref={ref} id="home" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <motion.div
          className="hero__copy"
          style={{ y: copyY, opacity: copyOpacity }}
        >
          <p className="hero__eyebrow label">
            Now: Data Scientist Intern at Monee (MariBank)
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span>Zheng Wei</span>
            </span>
            <span className="hero__line">
              <span>Ow</span>
            </span>
          </h1>
          <p className="hero__sub">
            Final-year NUS Business Analytics student building data science and
            machine learning solutions, from raw data to deployed models.
          </p>
          <div className="hero__ctas">
            <Magnetic>
              <a className="btn btn--primary" href="#projects">
                <RollText>View projects</RollText>
                <PiArrowDownRight aria-hidden="true" />
              </a>
            </Magnetic>
            <a className="btn btn--ghost" href="#contact">
              <RollText>Contact</RollText>
            </a>
          </div>
        </motion.div>
        <WorldStage style={{ y: worldY, scale: worldScale }} />
      </div>
    </section>
  );
}
