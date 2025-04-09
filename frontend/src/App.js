import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SubmitPage from "./pages/submitPage";
import './App.css';
import OceanWaves from "./OceanWaves";


function App() {
  return (
    <Router>
      <OceanWaves />;
      <div className="App">
        <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
          <Link to="/submit">Submit Raw Data</Link>
          
        </nav>

        <Routes>
          <Route path="/submit" element={<SubmitPage />} />
          <Route
            path="/"
            element={
              <header className="App-header">
                <img src="/logo192.png" className="App-logo" alt="logo" />
                <p>Welcome to the HAB Prediction App</p>
                <p>Use the navigation above to upload data.</p>
              </header>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
export default App;