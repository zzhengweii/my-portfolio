import React from "react";
import { motion } from "framer-motion";
import "../../styles/Projects.css";
import housing from "../../assets/images/housing.png";
import weather from "../../assets/images/weather.png";
import zwekers from "../../assets/images/dashboard.png";
import orbital from "../../assets/images/orbital.png";
import eaim from "../../assets/images/EAIMLogin.png";
import portfolio from "../../assets/images/portfolio.png";
import pawfectHome from "../../assets/images/pawfect.png";

const projects = [
  {
    tittle: "PawfectHome",
    description:
      "full-stack web application designed to connect pet adopters and listers, fostering a safe and loving community for pet rehoming",
    thumbnail: pawfectHome,
    stack: "Vue.js, CSS, JavaScript, Firebase, Node.js",
    code: "https://github.com/zzhengweii/PawfectHome",
    live: "https://pawfecthome-a7b3d.web.app/",
  },
  {
    title: "Entity Relationship Visualisation & Chatbot WebApp",
    description:
      "Developed an interactive web application that automates the extraction and visualization of entity relationships, enabling efficient data analysis. Integrated a chatbot powered by GroqAI to process ER diagrams and respond to natural language queries for SMU Datathon 2025",
    thumbnail: zwekers,
    stack: "React.js, Python (Flask/FastAPI), Firebase, PlantUML, GroqAI",
    code: "https://github.com/zzhengweii/zweckers",
  },

  {
    title: "Weather Prediction",
    description:
      "Designed and implemented a full-stack dashboard to help the marketing and sales teams track key performance indicators (KPIs). The dashboard streamlined operations by providing instant access to actionable insights",
    thumbnail: weather,
    stack: "Python, Scikit-learn, Pandas, NumPy",
    code: "https://github.com/zzhengweii/weather-prediction",
  },
  {
    title: "Personal Portfolio",
    description:
      "My portfolio website built using React.js and DevOps practices",
    thumbnail: portfolio,
    stack: "React.js, CSS, JavaScript",
    code: "https://github.com/zzhengweii/cloud-resume-challenge",
  },
  {
    title: "EAIM Dashboard",
    description:
      "Designed and implemented a full-stack dashboard to help the marketing and sales teams track key performance indicators (KPIs). The dashboard streamlined operations by providing instant access to actionable insights",
    thumbnail: eaim,
    stack: "React.js, Node.js, AWS CLoud",
  },
  {
    title: "VarsitySync",
    description:
      "Designed and implemented a full-stack dashboard to help the marketing and sales teams track key performance indicators (KPIs). The dashboard streamlined operations by providing instant access to actionable insights",
    thumbnail: orbital,
    stack: "React Native, JavaScript, Firebase",
    code: "https://github.com/zzhengweii/VarsitySync",
    poster:
      "https://drive.google.com/file/d/19W7TAgt_il57txeorsA4k5t-La77nVOD/view?usp=sharing",
  },
  {
    title: "Beijing Housing Price Insights",
    description:
      "Designed and implemented a full-stack dashboard to help the marketing and sales teams track key performance indicators (KPIs). The dashboard streamlined operations by providing instant access to actionable insights",
    thumbnail: housing,
    stack: "SQL, Tableau",
    slides:
      "https://nusu-my.sharepoint.com/:p:/r/personal/e1122416_u_nus_edu/Documents/Team_36_AS2.pptx?d=wf621cd8cb98942b29588bcef1807caf5&csf=1&web=1&e=R6j1nX",
  },
];

const TechStack = ({ stack }) => {
  return <span className="tech-stack">{stack}</span>;
};

const Projects = () => {
  return (
    <div className="projects-container">
      <div className="pt-20 lg:pt-0"></div>
      <h1 className="projects-heading">Projects</h1>
      <div className="projects-content">
        <div className="projects-grid">
          {projects.map((project, index) => {
            const fadeInDirection =
              index % 2 === 0
                ? { x: -100, opacity: 0, rotateZ: -10 } // Left for even indexes
                : { x: 100, opacity: 0, rotateZ: 10 }; // Right for odd indexes

            return (
              <motion.div
                key={index}
                className="project-card"
                style={{ perspective: "1000px" }}
                initial={fadeInDirection}
                whileInView={{ x: 0, opacity: 1, rotateZ: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(230, 234, 183, 0.7)",
                }}
                animate={{ rotateX: 0, rotateY: 0 }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left - rect.width / 2;
                  const y = e.clientY - rect.top - rect.height / 2;

                  const perspective = 1000 + Math.abs(x) + Math.abs(y);
                  e.currentTarget.style.perspective = `${perspective}px`;

                  const rotateX = (y / rect.height) * 30;
                  const rotateY = (x / rect.width) * 30;
                  e.currentTarget.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "rotateX(0deg) rotateY(0deg) scale(1)";
                  e.currentTarget.style.perspective = "1000px";
                }}
              >
                <div className="project-thumbnail-container">
                  <img
                    alt="blog"
                    loading="lazy"
                    className="project-thumbnail"
                    src={project.thumbnail}
                  />
                </div>
                <div className="project-details">
                  <h2 className="project-title">{project.title}</h2>
                  <p className="project-description">{project.description}</p>
                  <div className="tech-stacks">
                    {project.stack.split(", ").map((tech, techIndex) => (
                      <TechStack stack={tech} key={techIndex} />
                    ))}
                  </div>
                  <div className="project-links">
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noreferrer"
                        className="project-link"
                      >
                        Live
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="link-icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                          ></path>
                          <path d="M13 9a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-10z"></path>
                          <path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h9"></path>
                          <path d="M16 9h2"></path>
                        </svg>
                      </a>
                    )}
                    {project.code && (
                      <a
                        href={project.code}
                        target="_blank"
                        rel="noreferrer"
                        className="project-link"
                      >
                        Source Code
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="link-icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                          ></path>
                          <path d="M7 8l-4 4l4 4"></path>
                          <path d="M17 8l4 4l-4 4"></path>
                          <path d="M14 4l-4 16"></path>
                        </svg>
                      </a>
                    )}
                    {project.poster && (
                      <a
                        href={project.poster}
                        target="_blank"
                        rel="noreferrer"
                        className="project-link"
                      >
                        Poster
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="link-icon"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                      </a>
                    )}
                    {project.slides && (
                      <a
                        href={project.slides}
                        target="_blank"
                        rel="noreferrer"
                        className="project-link"
                      >
                        Slides
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="link-icon"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="16"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M3 10h18"></path>
                          <path d="M10 3v1"></path>
                          <path d="M14 3v1"></path>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Projects;
