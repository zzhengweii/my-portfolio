import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { experience } from "../data/content";
import { Parallax, Reveal } from "./ui/motion";
import "./Experience.css";

export default function Experience() {
  const routeRef = useRef(null);
  const reduce = useReducedMotion();
  // The route line fills in as you read down the list.
  const { scrollYProgress } = useScroll({
    target: routeRef,
    offset: ["start 70%", "end 55%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      id="experience"
      className="section experience"
      aria-labelledby="experience-title"
    >
      <div className="container">
        <Parallax distance={56}>
          <Reveal as="h2" className="section-title" id="experience-title">
            Experience
          </Reveal>
        </Parallax>

        <div ref={routeRef} className="route">
          <span className="route__track" aria-hidden="true" />
          <motion.span
            className="route__fill"
            aria-hidden="true"
            style={{ scaleY: reduce ? 1 : progress }}
          />
          <ol className="route__list">
            {experience.map((job) => (
              <Reveal
                as="li"
                key={job.company}
                className={`stop${job.current ? " is-current" : ""}`}
              >
                <span className="stop__node" aria-hidden="true" />
                <p className="stop__period mono">
                  {job.period}
                  {job.current && <span className="stop__now">Now</span>}
                </p>
                <div className="stop__main">
                  <h3 className="stop__company">{job.company}</h3>
                  <p className="stop__role">{job.role}</p>
                  <ul className="stop__points">
                    {job.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  {job.tags && (
                    <ul className="stop__tags" aria-label="Model areas">
                      {job.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {job.figures.length > 0 && (
                  <Parallax as="ul" className="stop__figures" distance={64}>
                    {job.figures.map((figure) => (
                      <li key={figure.label}>
                        <strong className="figure__value">
                          {figure.value}
                        </strong>
                        <span className="figure__label">{figure.label}</span>
                      </li>
                    ))}
                  </Parallax>
                )}
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
