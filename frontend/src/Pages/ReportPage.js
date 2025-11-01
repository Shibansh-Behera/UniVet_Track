import React, { useState, useRef, useEffect } from "react";
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
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCategory =
      formData.category === "other" ? formData.customCategory : formData.category;

    const reportData = { ...formData, category: finalCategory };
    console.log("Submitted form:", reportData);

    setSubmitted(true);
    alert(
      `✅ Animal report submitted successfully!\nCategory: ${finalCategory}\nStatus: Yet to be picked up`
    );
  };

  return (
    <div className="user-container">
      <h1>🐾 Report an Injured / Stray Animal</h1>

      <form className="report-form" onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" name="name" onChange={handleChange} required />

        <label>Contact Number:</label>
        <input type="tel" name="contact" onChange={handleChange} required />

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
