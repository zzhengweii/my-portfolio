import React from "react";
import { motion } from "framer-motion";
import { FaLinkedinIn as LinkedinIcon } from "react-icons/fa";
import { IoLogoGithub as GithubIcon } from "react-icons/io";
import { SiGmail as MailIcon } from "react-icons/si";
import "../../styles/Footer.css";

const Footer = () => {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const perspective = 1000 + Math.abs(x) + Math.abs(y);
    e.currentTarget.style.perspective = `${perspective}px`;

    const rotateX = (y / rect.height) * 50;
    const rotateY = (x / rect.width) * 50;
    e.currentTarget.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    e.currentTarget.style.perspective = "1000px";
  };

  return (
    <footer className="footer">
      <div className="footer-icons">
        {/* GitHub Icon - Fade in from Left on Scroll */}
        <motion.a
          className="icon"
          href="https://github.com/zzhengweii"
          target="_blank"
          rel="noreferrer"
          aria-label="Follow me on Github"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            duration: 1, // Longer duration for smoother animation
            ease: [0.22, 1, 0.36, 1], // Custom easing for smoother ending
          }}
          viewport={{ once: true, amount: 0.3 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <GithubIcon size={40} className="github-icon" />
        </motion.a>

        {/* LinkedIn Icon - Fade in from Bottom on Scroll (Slightly Slower) */}
        <motion.a
          href="https://www.linkedin.com/in/owzhengwei/"
          target="_blank"
          rel="noreferrer"
          className="icon"
          aria-label="Follow me on LinkedIn"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2, // Longer duration for smoother animation
            ease: [0.22, 1, 0.36, 1], // Custom easing for smoother ending
            delay: 0.2,
          }}
          viewport={{ once: true, amount: 0.3 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <LinkedinIcon size={40} className="linkedin-icon" />
        </motion.a>

        {/* Gmail Icon - Fade in from Right on Scroll */}
        <motion.a
          href="mailto:owzhengwei.work@gmail.com"
          target="_blank"
          rel="noreferrer"
          className="icon"
          aria-label="Email me"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          viewport={{ once: true, amount: 0.3 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <MailIcon size={40} className="mail-icon" />
        </motion.a>
      </div>

      {/* Footer Text - Fade in from Bottom on Scroll */}
      <motion.div
        className="footer-text"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.4,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.3,
        }}
        viewport={{ once: true, amount: 0.3 }}
      ></motion.div>
      <div className="footer-text">&copy; 2025 Ow Zheng Wei</div>
    </footer>
  );
};

export default Footer;
