import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import UserLoginPage from "./Pages/UserLoginPage";
import AdminLoginPage from "./Pages/AdminLoginPage";
import UserHome from "./Pages/UserHome";
import ReportPage from "./Pages/ReportPage";
import TrackPage from "./Pages/TrackPage";
import AdminPage from "./Pages/AdminPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/track" element={<TrackPage />} />
        <Route path="/admin-page" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
