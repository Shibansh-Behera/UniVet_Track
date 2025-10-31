import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserHome.css";
import { useLocation } from "react-router-dom";

const UserHome = () => {
  const [showPopup, setShowPopup] = useState(true);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { uid, name, email, role } = state || {};

  const handleChoice = (option) => {
    setShowPopup(false);
    if (option === "report") navigate("/report");
    else navigate("/track");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      navigate("/"); // Redirect to home page
    }
  };

  return (
    <div className="user-home">
      <button className="logout-btn" onClick={handleLogout}>
        ⎋ Logout
      </button>

      <h1>Welcome Back 🐾</h1>
      <h1>Welcome, {name} ({role})</h1>
      <p>Email: {email}</p>
      <p>UID: {uid}</p>
      <p>Helping animals starts with a single step — choose your action below.</p>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box animate-popup">
            <h2>What would you like to do?</h2>
            <div className="popup-buttons">
              <button className="report-btn" onClick={() => handleChoice("report")}>
                📋 Report an Animal
              </button>
              <button className="track-btn" onClick={() => handleChoice("track")}>
                🔍 Track Animal Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
