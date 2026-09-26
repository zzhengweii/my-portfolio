import React, { useRef } from "react";
import { useInView } from "framer-motion";
import photo640 from "../assets/img/zhengwei-marina-bay-640.webp";
import photo1000 from "../assets/img/zhengwei-marina-bay-1000.webp";
import { facts, toolkit } from "../data/content";
import { Reveal } from "./ui/motion";
import "./About.css";

export default function About() {
  const photoRef = useRef(null);
  const photoInView = useInView(photoRef, {
    once: true,
    margin: "0px 0px -15% 0px",
  });

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <figure
          ref={photoRef}
          className={`about__photo${photoInView ? " is-in" : ""}`}
        >
          <img
            src={photo1000}
            srcSet={`${photo640} 640w, ${photo1000} 1000w`}
            sizes="(min-width: 960px) 38vw, 92vw"
            width="1000"
            height="1250"
            loading="lazy"
            decoding="async"
            alt="Zheng Wei in a white shirt at Marina Bay, with the Singapore skyline lit up at dusk behind him."
          />
        </figure>

        <div className="about__body">
          <Reveal as="h2" className="about__statement" id="about-title">
            I'm a final-year Business Analytics student at NUS, specialising in
            machine learning and financial analytics.
          </Reveal>
          <Reveal as="p" className="about__text" delay={0.08}>
            I've shipped BI tools for a sourcing team and anomaly detection for
            a fleet of 300+ vessels, and I now help validate credit, fraud and
            AML models at a digital bank. Away from the laptop, I paddle for NUS
            Dragon Boat.
          </Reveal>

          <Reveal as="dl" className="about__facts" delay={0.12}>
            {facts.map((fact) => (
              <div key={fact.term} className="about__fact">
                <dt className="label">{fact.term}</dt>
                <dd>{fact.detail}</dd>
              </div>
            ))}
          </Reveal>

          <Reveal className="about__toolkit" delay={0.16}>
            {toolkit.map((group) => (
              <div key={group.group} className="toolkit">
                <h3 className="label">{group.group}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
