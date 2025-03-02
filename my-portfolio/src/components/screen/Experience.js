import React, { useEffect, useState } from "react";
import reactLogo from "../../assets/icons/React.png";
import sqlLogo from "../../assets/icons/SQL.png";
import nodeLogo from "../../assets/icons/NodeJS.png";
import excelLogo from "../../assets/icons/excel.png";
import EAIM from "../../assets/logos/EAIM.png";
import crocs from "../../assets/logos/crocs.png";
import army from "../../assets/logos/army.png";
import "../../styles/Experience.css";

const Experience = () => {
  const experiences = [
    {
      title: "Software Engineer/ Data Analyst Intern",
      company: "East Asia Institute of Management",
      year: "Dec 2024 - Jan 2025",
      description:
        "Designed dashboards and visualisations, analysed datasets for insights, and enhanced BI solutions for scalability and performance",
      companyLogo: EAIM,
      skillsImages: [sqlLogo, reactLogo, nodeLogo],
    },
    {
      title: "Retail Associate",
      company: "Crocs",
      year: "Mar 2023 - Jun 2023",
      description:
        "Provided product knowledge, guided customers through new launches, and achieved 50% higher sales in-store",
      companyLogo: crocs,
      skillsImages: [],
    },
    {
      title: "Army Intelligence Specialist",
      company: "Singapore Army",
      year: "Jan 2021 - Nov 2022",
      description:
        "Co-managed a team and participated in planning for infiltration missions to gather critical intelligence",
      companyLogo: army,
      skillsImages: [excelLogo],
    },
  ];

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
                          {img.includes("React")
                            ? "REACT"
                            : img.includes("SQL")
                            ? "SQL"
                            : img.includes("Node")
                            ? "NODE.JS"
                            : img.includes("excel")
                            ? "EXCEL"
                            : "Skill"}
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
