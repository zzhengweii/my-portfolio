import React, { useState } from "react";
import "../../styles/Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Hamburger Menu Button */}
      <button
        className={`menu-button ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#f7f7f7"
        >
          <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
        </svg>
      </button>

      {/* Navigation Links */}
      <ul className={`navbar-list ${menuOpen ? "open" : ""}`}>
        <li>
          <a
            href="#home"
            className="navbar-link"
            onClick={() => setMenuOpen(false)}
          >
            HOME
          </a>
        </li>
        <li>
          <a
            href="#about"
            className="navbar-link"
            onClick={() => setMenuOpen(false)}
          >
            ABOUT
          </a>
        </li>
        <li>
          <a
            href="#experience"
            className="navbar-link"
            onClick={() => setMenuOpen(false)}
          >
            EXPERIENCE
          </a>
        </li>
        <li>
          <a
            href="#projects"
            className="navbar-link"
            onClick={() => setMenuOpen(false)}
          >
            PROJECTS
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="navbar-link"
            onClick={() => setMenuOpen(false)}
          >
            CONTACT
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
