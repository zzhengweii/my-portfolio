import React from "react";
import ParticlesComponent from "./components/particles";
import Navbar from "./components/Nabvar";
import "./App.css";

function App() {
  return (
    <div className="App">
      <nav>
        <Navbar />
      </nav>
      <ParticlesComponent id="particles" />
      <h1>Particles are so fun!</h1>
    </div>
  );
}

export default App;
