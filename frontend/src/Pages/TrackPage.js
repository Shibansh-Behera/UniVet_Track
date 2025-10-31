// src/Pages/TrackStatus.js
import React, { useState } from "react";
import "./TrackPage.css";

const TrackStatus = () => {
  const [reportId, setReportId] = useState("");
  const [status, setStatus] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();

    // Simulate a fetch request — replace later with backend API
    if (reportId.trim() === "") {
      setStatus("Please enter a valid Report ID.");
      return;
    }

    // Simulated status for now
    const sampleStatuses = [
      "Yet to be picked up 🕐",
      "Picked up 🚚",
      "Under Treatment 💉",
      "Recovered ❤️",
    ];

    const randomStatus =
      sampleStatuses[Math.floor(Math.random() * sampleStatuses.length)];
    setStatus(`Current status: ${randomStatus}`);
  };

  return (
    <div className="track-container">
      <h1>Track Animal Rescue Status 🐾</h1>
      <form onSubmit={handleTrack} className="track-form">
        <input
          type="text"
          placeholder="Enter your Report ID"
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
        />
        <button type="submit">Check Status</button>
      </form>

      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default TrackStatus;
