import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

      // Check if role doc exists; if not, create with role "user"
      const roleRef = doc(db, "roles", uid);
      const roleSnap = await getDoc(roleRef);

      let role = "user";
      if (!roleSnap.exists()) {
        await setDoc(roleRef, { role: "user" }, { merge: true });
      } else {
        const data = roleSnap.data();
        role = typeof data.role === "string" ? data.role : "user";
      }

      // Prepare user payload and navigate to UserHome
      const userData = { uid, name, email, role };
      navigate("/user-home", { state: userData });
    } catch (error) {
      console.error("Error during sign-in:", error);
      setErrorMsg("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>User Login</h2>

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

export default UserLoginPage;
