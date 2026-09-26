import React from "react";
import { MotionConfig } from "framer-motion";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Activities from "./components/Activities";
import Contact from "./components/Contact";
import SkipLink from "./components/SkipLink";
import Sky from "./components/Sky";
import { ThemeProvider } from "./components/theme";

function App() {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <SkipLink />
        <Sky />
        <Nav />
        <main id="main">
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Activities />
          <Contact />
        </main>
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
