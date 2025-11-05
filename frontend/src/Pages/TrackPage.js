import React from "react";
import "./TrackPage.css";
import StatusTracker from "../Components/StatusTracker";

const TrackPage = () => {
  return (
    <div className="track-container">
      <h1>Track Animal Rescue Status 🐾</h1>
      <StatusTracker />
    </div>
  );
};

export default TrackPage;
