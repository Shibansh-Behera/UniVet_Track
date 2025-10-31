import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
// import UserLogin from "./Pages/UserLogin";
// import AdminLogin from "./Pages/AdminLogin";
import UserHome from "./Pages/UserHome";
import ReportAnimal from "./Pages/ReportPage";
import TrackStatus from "./Pages/TrackPage";
import UserLoginPage from "./Pages/UserLoginPage";
import AdminLoginPage from "./Pages/AdminLoginPage";  
import AdminPage from "./Pages/AdminPage"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        

        {/* User protected routes */}
        <Route path="/admin-page" element={<AdminPage />} />
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/report" element={<ReportAnimal />} />
        <Route path="/track" element={<TrackStatus />} />
      </Routes>
    </Router>
  );
}

export default App;
