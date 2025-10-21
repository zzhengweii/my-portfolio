import React, { useEffect, useState } from "react";
import reactLogo from "../../assets/icons/React.png";
import sqlLogo from "../../assets/icons/SQL.png";
import nodeLogo from "../../assets/icons/NodeJS.png";
import excelLogo from "../../assets/icons/excel.png";
import powerBiLogo from "../../assets/icons/powerBI.png";
import fastApiLogo from "../../assets/icons/fastAPI.png";
import pandasLogo from "../../assets/icons/pandas.png";
import copilotLogo from "../../assets/icons/Copilot.png";
import keurig from "../../assets/logos/Keurig.png";
import EAIM from "../../assets/logos/EAIM.png";
import crocs from "../../assets/logos/crocs.png";
import army from "../../assets/logos/army.png";
import "../../styles/Experience.css";

const Experience = () => {
  const experiences = [
    {
      title: "Data Analyst Intern",
      company: "Keurig Dr Pepper Singapore",
      year: "May 2025 - Current",
      description:
        "Spearheaded, AI-driven analytics, automated BI dashboards and data pipelines to replace manual reporting, cutting approximately 10 hrs/week, and enabling more than $100K savings for Tier‑1 sourcing",
      companyLogo: keurig,
      skillsImages: [
        reactLogo,
        fastApiLogo,
        pandasLogo,
        powerBiLogo,
        excelLogo,
        copilotLogo,
      ],
    },
    {
      title: "Software Engineer/ Data Analyst Intern",
      company: "East Asia Institute of Management",
      year: "Dec 2024 - Jan 2025",
      description:
        "Built React dashboards and SQL‑driven insights that boosted operational efficiency 25% and improved decisions via rapid, user‑tested iterations",
      companyLogo: EAIM,
      skillsImages: [sqlLogo, reactLogo, nodeLogo],
    },
    {
      title: "Retail Associate",
      company: "Crocs",
      year: "Mar 2023 - Jun 2023",
      description:
        "Exceeded sales targets by 30% through consultative service and product expertise while supporting inventory and visual merchandising",
      companyLogo: crocs,
      skillsImages: [],
    },
    {
      title: "Army Intelligence Specialist",
      company: "Singapore Army",
      year: "Jan 2021 - Nov 2022",
      description:
        "Led a 4‑person intelligence team to execute reconnaissance and mission planning under pressure, delivering actionable intel and raising unit readiness",
      companyLogo: army,
      skillsImages: [excelLogo],
    },
  ];

  // Skill labels for tooltips
  const skillLabels = {
    [reactLogo]: "REACT",
    [sqlLogo]: "SQL",
    [nodeLogo]: "NODE.JS",
    [excelLogo]: "EXCEL",
    [powerBiLogo]: "POWER BI",
    [fastApiLogo]: "FASTAPI",
    [pandasLogo]: "PANDAS",
    [copilotLogo]: "COPILOT",
  };

  const [isVisible, setIsVisible] = useState(
    new Array(experiences.length).fill(false)
  );

  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible((prev) => {
          const newVisibility = [...prev];
          entries.forEach((entry) => {
            const index = entry.target.dataset.index; // Get the index from the data attribute
            if (entry.isIntersecting) {
              newVisibility[index] = true;
            }
          });
          return newVisibility;
        });
      },
      { threshold: 0.001 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="experience-container">
      <h1>Experience</h1>
      <div className="timeline">
        {experiences.map((exp, index) => (
          <div
            key={index}
            data-index={index}
            className={`experience-item fade-in ${
              isVisible[index] ? "visible" : ""
            } ${index % 2 === 0 ? "left" : "right"}`}
          >
            <div className="content">
              <div className="header">
                <img
                  src={exp.companyLogo}
                  alt={`${exp.company} logo`}
                  className="company-logo"
                />
                <div className="text">
                  <p className="job">{exp.title}</p>
                  <p className="company-name">{exp.company}</p>
                  <p className="year">{exp.year}</p>
                  <p className="des">{exp.description}</p>
                  <div className="skills">
                    {exp.skillsImages.map((img, i) => (
                      <div key={i} className="tooltip-container">
                        <img src={img} alt="Skill" className="skill-icon" />
                        <span className="tooltip">
                          {skillLabels[img] || "Skill"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experience;
