import React, { useState, useEffect } from "react";
import Navbar from "./components /screen/Navbar";
import Home from "./components /screen/Home";
import Loading from "./components /screen/Loading";
import About from "./components /screen/About";
import Experience from "./components /screen/Experience";
import Projects from "./components /screen/Projects";
import Contact from "./components /screen/Contact";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading process (e.g., fetching data)
    setTimeout(() => {
      setLoading(false); // Set loading to false after 3 seconds
    }, 3000);
  }, []);

  return (
    <div className="website">
      {/* Show Loading Screen while loading */}
      {loading ? (
        <div className="loading-container">
          <Loading /> {/* Your loading spinner */}
        </div>
      ) : (
        <div>
          <Navbar />

          <div id="home">
            <Home />
          </div>
          <div id="about">
            <About />
          </div>

          {/* <div id="experience">
            <Experience />
          </div>
          <div id="projects">
            <Projects />
          </div>
          <div id="contact">
            <Contact />
          </div> */}
        </div>
      )}
    </div>
  );
}

export default App;
