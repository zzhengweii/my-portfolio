import React, { useState, useEffect, useRef } from "react";
import "../../styles/Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const lastScrollY = useRef(window.scrollY);
  const hideTimeout = useRef(null);

  // Hover handlers
  const handleMouseEnter = () => {
    setIsHovered(true);
    clearTimeout(hideTimeout.current);
    setShowNavbar(true); // ensure it's shown
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Hide after delay only if scrollY > 10
    if (window.scrollY > 10) {
      hideTimeout.current = setTimeout(() => {
        setShowNavbar(false);
      }, 1500);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < 10) {
          setShowNavbar(true);
          clearTimeout(hideTimeout.current);
        } else if (currentScrollY < lastScrollY.current) {
          setShowNavbar(true);
          clearTimeout(hideTimeout.current);
          if (!isHovered) {
            hideTimeout.current = setTimeout(() => {
              setShowNavbar(false);
            }, 1500);
          }
        } else if (currentScrollY > lastScrollY.current) {
          clearTimeout(hideTimeout.current);
          if (!isHovered) {
            setShowNavbar(false);
          }
        }

        lastScrollY.current = currentScrollY;
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(hideTimeout.current);
    };
  }, [isHovered]); // re-run effect if hover state changes

  return (
    <nav
      className={`navbar glassy-navbar ${showNavbar ? "show" : "hide"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
