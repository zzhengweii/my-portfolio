import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PiArrowUpRight, PiX } from "react-icons/pi";
import RollText from "./ui/RollText";
import { EASE_OUT } from "./ui/motion";

/*
 * Tap-to-open picture for touch screens. The thumbnail grows into the dialog
 * through a shared layoutId and shrinks back on close. Close with the button,
 * a tap outside, Escape, or by dragging the card down.
 */
export default function ProjectLightbox({ project, children, onClose }) {
  const closeRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = document.getElementById("root");
    const html = document.documentElement;
    const trigger = document.activeElement;
    // Everything behind the dialog is inert: no focus, no reading, no taps.
    root?.setAttribute("inert", "");
    html.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root?.removeAttribute("inert");
      html.style.overflow = "";
      trigger?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  const onDragEnd = (_, info) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <motion.div
        className="lightbox__backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
      <motion.div
        className="lightbox__card"
        drag={reduce ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.08, bottom: 0.7 }}
        onDragEnd={onDragEnd}
      >
        {/* The card's paper is its own layer, so it can fade in and out
            without dimming the picture flying in and out on top of it. */}
        <motion.div
          className="lightbox__paper"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.16 } }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
        />
        <motion.div
          layoutId={`shot-${project.id}`}
          className="lightbox__frame"
          style={{ borderRadius: 16 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.14 }}
        >
          {children}
        </motion.div>

        <motion.div
          className="lightbox__caption"
          initial={{ opacity: 0, transform: "translateY(10px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          exit={{
            opacity: 0,
            transform: "translateY(6px)",
            transition: { duration: 0.14 },
          }}
          transition={{ duration: 0.4, delay: 0.12, ease: EASE_OUT }}
        >
          <p className="lightbox__meta mono">
            {project.year}
            <span aria-hidden="true"> / </span>
            {project.stack.join(", ")}
          </p>
          <h3 id="lightbox-title" className="lightbox__title">
            {project.title}
          </h3>
          <p className="lightbox__blurb">{project.blurb}</p>
          {project.links.length > 0 && (
            <div className="lightbox__links">
              {project.links.map((link) => (
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
              ))}
            </div>
          )}
        </motion.div>

        <motion.button
          ref={closeRef}
          type="button"
          className="lightbox__close"
          aria-label="Close"
          onClick={onClose}
          whileTap={{ scale: 0.94 }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
          transition={{ type: "spring", duration: 0.35, bounce: 0 }}
        >
          <PiX aria-hidden="true" />
        </motion.button>
      </motion.div>
    </div>,
    document.body,
  );
}
