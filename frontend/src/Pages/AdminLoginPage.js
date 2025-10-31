import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

      //  Check Firestore for role
      const roleRef = doc(db, "roles", uid);
      const roleSnap = await getDoc(roleRef);

      if (roleSnap.exists() && roleSnap.data().role === "admin") {
        const role = "admin";
        const userData = { uid, name, email, role };

        // Redirect to AdminPage with user data
        navigate("/admin-page", { state: userData });
      } else {
        // Not an admin
        setErrorMsg("Access denied: You are not an admin.");
      }
    } catch (error) {
      console.error("Error during admin sign-in:", error);
      setErrorMsg("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>

      <button
        onClick={handleGoogleLogin}
        className="btn google-btn"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>

      {errorMsg && (
        <div className="error-block">
          <p>{errorMsg}</p>
          <button
            className="btn retry-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLoginPage;