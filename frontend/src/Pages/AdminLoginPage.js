import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { auth, provider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const uid = user.uid;
      const name = user.displayName || "";
      const email = user.email || "";

      // Check Firestore for role
      const roleRef = doc(db, "roles", uid);
      const roleSnap = await getDoc(roleRef);

      if (roleSnap.exists() && roleSnap.data().role === "admin") {
        // Exchange Firebase ID token for backend JWT (keeps your flow, adds backend auth)
        try {
          const idToken = await user.getIdToken();
          const { data } = await API.post("/users/googleLogin", { idToken });
          localStorage.setItem("token", data.token);
        } catch (_) {}

        const role = "admin";
        const userData = { uid, name, email, role };
        navigate("/admin-page", { state: userData });
      } else {
        setErrorMsg("Access denied: You are not an admin.");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Sign-in failed. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <button onClick={handleGoogleLogin} className="btn google-btn" disabled={loading}>
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>
      {errorMsg && <div className="error-block"><p>{errorMsg}</p></div>}
    </div>
  );
};

export default AdminLoginPage;