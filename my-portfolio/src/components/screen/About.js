import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "../../styles/About.css";
import picture from "../../assets/images/my_pic.png";
import { useInView } from "react-intersection-observer";

const About = () => {
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    console.log("In view:", inView);
  }, [inView]);

  return (
    <motion.div
      className="about-container"
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* About Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        About
      </motion.h1>

      {/* About Section */}
      <motion.div
        className="about-content"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        {/* Text Section */}
        <div className="about-text">
          <div className="helloTittle">Hello</div>
          <p>👋 I’m Ow Zheng Wei,</p>
          <div className="description">
            Y2 Business Analytics Student at the National University of
            Singapore. Passionate about Data Science and Machine Learning. If we
            share similar interests, let’s connect 🚀!
          </div>
        </div>
      </motion.div>

      {/* Image */}
      <motion.div
        className="about-image"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <img src={picture} alt="Profile" />
      </motion.div>

      {/* Tech Section */}
      <motion.div
        className="tech-category"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <motion.div
          className="headings-container"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="headings">LANGUAGES:</div>
          <div className="tech-items-wrapper">
            {["PYTHON", "SQL", "R", "JAVA SCRIPT", "JAVA", "HTML", "CSS"].map(
              (item, index) => (
                <motion.div
                  key={item}
                  className="item1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                >
                  {item}
                </motion.div>
              )
            )}
          </div>
        </motion.div>
        <motion.div
          className="headings-container"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div className="headings">FRAMEWORK & LIBRARIES:</div>
          <div className="tech-items-wrapper">
            {[
              "PANDAS",
              "NUMPY",
              "SQLALCHEMY",
              "REACT",
              "REACT NATIVE",
              "VUE",
            ].map((item, index) => (
              <motion.div
                key={item}
                className="item2"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="headings-container"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <div className="headings">DATABASE & TOOLS:</div>
          <div className="tech-items-wrapper">
            {[
              "MYSQL",
              "FIREBASE",
              "SNOWFLAKE",
              "TABLEAU",
              "POWER BI",
              "EXCEL",
              "GIT",
            ].map((item, index) => (
              <motion.div
                key={item}
                className="item3"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, delay: 1.6 }}
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="tech-container">Tech</div>
      </motion.div>
    </motion.div>
  );
};

export default About;
