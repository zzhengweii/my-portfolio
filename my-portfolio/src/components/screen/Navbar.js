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
    <>
      {/* Desktop Navbar */}
      <nav
        className={`navbar glassy-navbar ${showNavbar ? "show" : "hide"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Navigation Links - Only visible on desktop */}
        <ul className="navbar-list">
          <li>
            <a href="#home" className="navbar-link">
              HOME
            </a>
          </li>
          <li>
            <a href="#about" className="navbar-link">
              ABOUT
            </a>
          </li>
          <li>
            <a href="#experience" className="navbar-link">
              EXPERIENCE
            </a>
          </li>
          <li>
            <a href="#projects" className="navbar-link">
              PROJECTS
            </a>
          </li>
          <li>
            <a href="#contact" className="navbar-link">
              CONTACT
            </a>
          </li>
        </ul>
      </nav>

      {/* Mobile/Tablet Hamburger Menu Button */}
      <button
        className={`menu-button ${menuOpen ? "open" : ""} ${
          showNavbar ? "show" : "hide"
        }`}
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

      {/* Mobile/Tablet Menu Overlay */}
      <div className={`mobile-menu-overlay ${menuOpen ? "open" : ""}`}>
        <a
          href="#home"
          className="navbar-link"
          onClick={() => setMenuOpen(false)}
        >
          HOME
        </a>
        <a
          href="#about"
          className="navbar-link"
          onClick={() => setMenuOpen(false)}
        >
          ABOUT
        </a>
        <a
          href="#experience"
          className="navbar-link"
          onClick={() => setMenuOpen(false)}
        >
          EXPERIENCE
        </a>
        <a
          href="#projects"
          className="navbar-link"
          onClick={() => setMenuOpen(false)}
        >
          PROJECTS
        </a>
        <a
          href="#contact"
          className="navbar-link"
          onClick={() => setMenuOpen(false)}
        >
          CONTACT
        </a>
      </div>
    </>
  );
};

export default Navbar;
