import React, { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./UserPage.css";

const UserPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    category: "",
    customCategory: "",
    color: "",
    description: "",
    photo: null,
    location: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const customCategoryRef = useRef(null);

  // Auto-focus the "Specify Animal Type" input when "Other" is selected
  useEffect(() => {
    if (formData.category === "other" && customCategoryRef.current) {
      customCategoryRef.current.focus();
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    // Enforce input constraints for specific fields
    let nextValue = files ? files[0] : value;

    // Contact number: allow only digits, max 10
    if (name === "contact") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData({
      ...formData,
      [name]: nextValue,
    });
  };

  const ensureBackendToken = async () => {
    const existing = localStorage.getItem("token");
    if (existing) return true;
    try {
      let user = auth.currentUser;
      if (!user) {
        // wait for auth to initialize via listener
        user = await new Promise((resolve) => {
          const unsub = onAuthStateChanged(auth, (u) => {
            unsub();
            resolve(u || null);
          });
        });
      }
      if (!user) {
        // do a short poll in case auth initializes slightly later (cross-tab/port)
        const start = Date.now();
        while (!user && Date.now() - start < 3000) {
          await new Promise((r) => setTimeout(r, 100));
          user = auth.currentUser;
        }
        if (!user) return false;
      }
      const idToken = await user.getIdToken();
      const { data } = await API.post("/users/googleLogin", { idToken });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        return true;
      }
    } catch (_) {}
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasToken = await ensureBackendToken();
    if (!hasToken) {
      alert("Please sign in first to submit a report.");
      return;
    }
    const finalCategory = formData.category === "other" ? formData.customCategory : formData.category;

    // Try to parse lat/lng from Google Maps link if present
    let latitude = "";
    let longitude = "";
    try {
      const match = formData.location.match(/maps\?q=([0-9.-]+),([0-9.-]+)/);
      if (match) {
        latitude = match[1];
        longitude = match[2];
      }
    } catch {}

    try {
      if (latitude && longitude) {
        const { data: check } = await API.get(`/reports/checkExisting`, {
          params: { category: finalCategory, lat: latitude, lng: longitude },
        });
        if (check?.count > 0) {
          alert("Similar reports exist nearby. Please review before creating a new one.");
          return;
        }
      }

      const { data } = await API.post(`/reports/create`, {
        category: finalCategory,
        description: formData.description,
        photoUrl: null,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });

      setSubmitted(true);
      alert(data?.message || "Report created successfully");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit report";
      alert(msg);
    }
  };

  return (
    <div className="user-container">
      <h1>🐾 Report an Injured / Stray Animal</h1>

      <form className="report-form" onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" name="name" onChange={handleChange} required />

        <label>Contact Number*</label>
        <input
          type="tel"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          required
          inputMode="numeric"
          maxLength={10}
          pattern="[0-9]{10}"
          title="Enter a valid 10-digit contact number"
        />

        <label>Category:</label>
        <select name="category" onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="other">Other</option>
        </select>

        {formData.category === "other" && (
          <>
            <label>Specify Animal Type:</label>
            <input
              type="text"
              name="customCategory"
              placeholder="e.g., Cow, Monkey, Squirrel..."
              onChange={handleChange}
              ref={customCategoryRef}
              required
            />
          </>
        )}

        <label>Color:</label>
        <input type="text" name="color" onChange={handleChange} required />

        <label>Description:</label>
        <textarea
          name="description"
          placeholder="Describe the animal or injury..."
          onChange={handleChange}
          required
        ></textarea>

        <label>Location:</label>
<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
  <input
    type="text"
    name="location"
    placeholder="Enter or paste location link"
    value={formData.location}
    onChange={handleChange}
    required
    pattern="https?://.+"
    title="Enter a valid URL starting with http:// or https://"
  />
  <button
    type="button"
    onClick={() => {
      if (!navigator.geolocation) {
        alert("❌ Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setFormData((prev) => ({ ...prev, location: mapsLink }));
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("❌ Unable to fetch location. Please enter manually.");
        }
      );
    }}
  >
    📍 Use My Location
  </button>
</div>


        <label>Upload Photo:</label>
        <input type="file" name="photo" accept="image/*" onChange={handleChange} required />

        <button type="submit">Submit Report</button>
      </form>

      {submitted && (
        <div className="status-section">
          <h2>🐕 Current Animal Status</h2>
          <p className="status-message">
            <strong>Yet to be Picked Up</strong>
          </p>
          <p className="info-text">
            Status updates will be provided by the admin once your report is reviewed.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserPage;
