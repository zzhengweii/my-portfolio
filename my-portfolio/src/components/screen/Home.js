import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../../styles/Home.css";

const Home = () => {
  const [displayText, setDisplayText] = useState("");
  const fullText = "WELCOME";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 400); // Adjust speed as needed

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <motion.div
      className="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {displayText}
    </motion.div>
  );
};

export default Home;
