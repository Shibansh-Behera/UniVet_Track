import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { auth, provider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";


const UserLoginPage = () => {
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
      console.log(uid);
      // Ensure role doc exists with role "user"
      const roleRef = doc(db, "roles", uid);
      const roleSnap = await getDoc(roleRef);
      let role = "user";
      if (!roleSnap.exists()) {
        await setDoc(roleRef, { role: "user" }, { merge: true });
      } else {
        const data = roleSnap.data();
        role = typeof data.role === "string" ? data.role : "user";
      }

      // Exchange Firebase ID token for backend JWT (no change to UX)
      try {
        const idToken = await user.getIdToken();
        const { data } = await API.post("/users/googleLogin", { idToken });
        localStorage.setItem("token", data.token);
      } catch (_) {
        // If backend not available, continue; protected endpoints will fail until backend is up
      }

      const userData = { uid, name, email, role };
      console.log(userData.uid);
      navigate("/user-home", { state: userData });
    } catch (error) {
      console.error("Error during sign-in:", error);
      const msg = error?.response?.data?.message || "Sign-in failed. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>User Login</h2>
      <button onClick={handleGoogleLogin} className="btn google-btn" disabled={loading}>
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>
      {errorMsg && <div className="error-block"><p>{errorMsg}</p></div>}
    </div>
  );
};

export default UserLoginPage;
