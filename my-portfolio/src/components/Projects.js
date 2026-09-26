import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  PiArrowRight,
  PiArrowUpRight,
  PiArrowsOutSimple,
} from "react-icons/pi";
import { featuredProject, projects } from "../data/content";
import ProjectLightbox from "./ProjectLightbox";
import VesselSchematic, {
  VESSEL_NOTES,
  VESSEL_PARTS,
} from "./schematics/VesselSchematic";
import {
  FraudPreview,
  HealthcarePreview,
} from "./schematics/PreviewSchematics";
import RollText from "./ui/RollText";
import { Parallax, Reveal, useMediaQuery } from "./ui/motion";
import "./Projects.css";

const SCHEMATIC_PREVIEWS = {
  fraud: FraudPreview,
  healthcare: HealthcarePreview,
};

// describe: the preview is the main content (pop-up), so it gets alt text.
function Preview({ project, describe = false }) {
  const alt = describe ? project.preview.alt : "";
  if (project.preview.kind === "image") {
    return (
      <img
        src={project.preview.src}
        alt={alt}
        loading={describe ? "eager" : "lazy"}
        decoding="async"
        width="960"
        height="720"
      />
    );
  }
  const Diagram = SCHEMATIC_PREVIEWS[project.id];
  return describe ? (
    <div className="preview__diagram" role="img" aria-label={alt}>
      <Diagram />
    </div>
  ) : (
    <Diagram />
  );
}

// The drawing and the signal list share one selection: hovering or focusing
// previews a signal, clicking or tapping pins it until picked again.
function FeaturedSheet({ project }) {
  const [pinned, setPinned] = useState(null);
  const [hovered, setHovered] = useState(null);
  const active = hovered ?? pinned;
  const pick = useCallback(
    (i) => setPinned((current) => (current === i ? null : i)),
    [],
  );
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  return (
    <Reveal as="article" className="sheet" aria-labelledby="featured-title">
      <div className="sheet__drawing">
        <VesselSchematic active={active} onHover={setHovered} onPick={pick} />
      </div>

      <div className="sheet__intro">
        <h3 id="featured-title" className="sheet__title">
          {project.title}
        </h3>
        <p className="sheet__summary">{project.summary}</p>
      </div>

      <div className="sheet__signals">
        <ol className="sheet__parts" aria-label="Signals the model reads">
          {VESSEL_PARTS.map((part, i) => (
            <li key={part}>
              <button
                type="button"
                className={`part${active === i ? " is-active" : ""}`}
                aria-pressed={pinned === i}
                onClick={() => pick(i)}
                onPointerEnter={(e) =>
                  e.pointerType === "mouse" && setHovered(i)
                }
                onPointerLeave={(e) =>
                  e.pointerType === "mouse" && setHovered(null)
                }
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
              >
                <span className="balloon mono" aria-hidden="true">
                  {i + 1}
                </span>
                {part}
              </button>
            </li>
          ))}
        </ol>
        <p className="sheet__readout" aria-live="polite">
          {active === null ? (
            `${finePointer ? "Hover over" : "Tap"} a signal to trace it through the ship.`
          ) : (
            <>
              <strong>{VESSEL_PARTS[active]}.</strong> {VESSEL_NOTES[active]}
            </>
          )}
        </p>
      </div>

      <ol className="sheet__pipeline" aria-label="Modelling pipeline">
        {project.pipeline.map((step, i) => (
          <li key={step.label}>
            <strong className="sheet__value">{step.value}</strong>
            <span className="sheet__step-label">{step.label}</span>
            {i < project.pipeline.length - 1 && (
              <PiArrowRight className="sheet__arrow" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      <dl className="sheet__titleblock">
        <div>
          <dt className="label">Client</dt>
          <dd>{project.org}</dd>
        </div>
        <div>
          <dt className="label">Year</dt>
          <dd className="mono">{project.year}</dd>
        </div>
        <div className="sheet__stack">
          <dt className="label">Stack</dt>
          <dd>{project.stack.join(", ")}</dd>
        </div>
      </dl>
    </Reveal>
  );
}

// op.al-style index: a preview follows the cursor on a spring, leans with
// horizontal speed, and cross-fades between projects. Siblings dim in CSS.
// On touch screens and narrow windows each row shows a thumbnail instead,
// which opens the picture in a pop-up.
function ProjectIndex({ items }) {
  const [active, setActive] = useState(null);
  const [opened, setOpened] = useState(null);
  const tapToOpen = useMediaQuery(
    "(hover: none), (pointer: coarse), (max-width: 1024px)",
  );
  const finePointer = !tapToOpen;
  const close = useCallback(() => setOpened(null), []);
  const openedProject = items.find((project) => project.id === opened);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 320, damping: 32, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 320, damping: 32, mass: 0.6 });
  // Near the right or bottom edge the card flips to the other side of the cursor.
  const flipX = useMotionValue(0);
  const flipY = useMotionValue(0);
  const fx = useSpring(flipX, { stiffness: 260, damping: 30 });
  const fy = useSpring(flipY, { stiffness: 260, damping: 30 });
  const left = useTransform([sx, fx], ([a, b]) => a + b);
  const top = useTransform([sy, fy], ([a, b]) => a + b);
  const velocity = useVelocity(sx);
  const rotate = useSpring(
    useTransform(velocity, [-2000, 0, 2000], [-9, 0, 9], { clamp: true }),
    {
      stiffness: 220,
      damping: 26,
    },
  );

  const onPointerMove = (e) => {
    if (e.pointerType !== "mouse") return;
    x.set(e.clientX);
    y.set(e.clientY);
    flipX.set(e.clientX > window.innerWidth - 420 ? -420 : 0);
    flipY.set(e.clientY > window.innerHeight - 330 ? -330 : 0);
  };

  return (
    <div
      className={`index${tapToOpen ? " index--tap" : ""}`}
      onPointerMove={finePointer ? onPointerMove : undefined}
      onPointerLeave={() => setActive(null)}
    >
      <ul className={`index__list${active ? " has-active" : ""}`}>
        {items.map((project) => (
          <li
            key={project.id}
            className={`index__row${active === project.id ? " is-active" : ""}`}
            onPointerEnter={(e) => {
              if (e.pointerType !== "mouse") return;
              if (!active) {
                x.jump(e.clientX);
                y.jump(e.clientY);
              }
              setActive(project.id);
            }}
          >
            <span className="index__year mono">{project.year}</span>
            <div className="index__main">
              <h3 className="index__title">{project.title}</h3>
              <p className="index__blurb">{project.blurb}</p>
              <p className="index__stack">{project.stack.join(", ")}</p>
            </div>
            {tapToOpen && (
              <button
                type="button"
                className="index__thumb"
                aria-haspopup="dialog"
                aria-label={`Open picture: ${project.title}`}
                onClick={() => setOpened(project.id)}
              >
                <motion.span
                  layoutId={`shot-${project.id}`}
                  className={`index__shot${opened === project.id ? " is-open" : ""}`}
                  style={{ borderRadius: 12 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.14 }}
                >
                  <Preview project={project} />
                </motion.span>
                <span className="index__zoom" aria-hidden="true">
                  <PiArrowsOutSimple />
                </span>
              </button>
            )}
            <div className="index__links">
              {project.links.length > 0 ? (
                project.links.map((link) => (
                  <a
                    key={link.kind}
                    className="index__link"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${link.kind}: ${project.title} (opens in a new tab)`}
                  >
                    <RollText>{link.kind}</RollText>
                    <PiArrowUpRight aria-hidden="true" />
                  </a>
                ))
              ) : (
                <span className="index__private">Internal tool</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {openedProject && (
          <ProjectLightbox
            key={openedProject.id}
            project={openedProject}
            onClose={close}
          >
            <Preview project={openedProject} describe />
          </ProjectLightbox>
        )}
      </AnimatePresence>

      {finePointer &&
        createPortal(
          <motion.div
            className={`preview${active ? " is-visible" : ""}`}
            style={{ x: left, y: top, rotate, originX: 0, originY: 0 }}
            aria-hidden="true"
          >
            <div className="preview__frame">
              {items.map((project) => (
                <div
                  key={project.id}
                  className={`preview__item${active === project.id ? " is-active" : ""}`}
                >
                  <Preview project={project} />
                </div>
              ))}
            </div>
          </motion.div>,
          document.body,
        )}
    </div>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="section projects"
      aria-labelledby="projects-title"
    >
      <div className="container">
        <Parallax distance={28}>
          <Reveal as="h2" className="section-title" id="projects-title">
            Selected projects
          </Reveal>
        </Parallax>
        <FeaturedSheet project={featuredProject} />
        <ProjectIndex items={projects} />
      </div>
    </section>
  );
}
