import React, { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import "./UserPage.css";
import { useLocation } from "react-router-dom";


const UserPage = () => {
  const { state } = useLocation();
  const { uid, name, email, role } = state || {};
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

  // const ensureBackendToken = async () => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     alert("Please sign in first to submit a report.");
  //     return false;
  //   }
  //   return true;
  // };

  const uploadPhoto = async (photoFile) => {
    if (!photoFile) return null;
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("photo", photoFile);
      
      const { data } = await API.post("/reports/uploadPhoto", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return data?.photoUrl || null;
    } catch (err) {
      console.error("Photo upload error:", err);
      throw new Error("Failed to upload photo. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent || "Submit Report";
    const restoreButton = () => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    };
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }
    
    try {
      // const hasToken = await ensureBackendToken();
      // if (!hasToken) {
      //   restoreButton();
      //   return;
      // }
      
      const finalCategory = formData.category === "other" ? formData.customCategory : formData.category;

      // Validate required fields
      if (!finalCategory) {
        alert("Please select a category.");
        restoreButton();
        return;
      }
      
      if (!formData.location) {
        alert("Please provide a location.");
        restoreButton();
        return;
      }

      // Try to parse lat/lng from Google Maps link if present
      let latitude = "";
      let longitude = "";
      
      // Handle multiple Google Maps URL formats
      const locationPatterns = [
        /maps\?q=([0-9.-]+),([0-9.-]+)/,  // maps?q=lat,lng
        /@([0-9.-]+),([0-9.-]+)/,         // @lat,lng
        /place\/[^\/]+\/@([0-9.-]+),([0-9.-]+)/, // place/.../@lat,lng
        /maps\?q=([0-9.-]+)$/,  // maps?q=lat only (fallback - will use 0 for lng)
      ];
      
      let matched = false;
      for (const pattern of locationPatterns) {
        const match = formData.location.match(pattern);
        if (match) {
          latitude = match[1];
          longitude = match[2] || latitude; // If only one coord, use same for both (user should use "Use My Location")
          matched = true;
          break;
        }
      }
      
      if (!latitude || !longitude || !matched) {
        alert("Could not parse location coordinates from the URL. Please:\n1. Use the 'Use My Location' button, OR\n2. Paste a complete Google Maps link with coordinates (e.g., https://www.google.com/maps?q=22.22,88.44)");
        restoreButton();
        return;
      }
      
      // Validate coordinates are valid numbers
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
        alert("Invalid coordinates detected. Please use the 'Use My Location' button or provide a valid Google Maps link.");
        restoreButton();
        return;
      }

      // Upload photo if provided
      let photoUrl = null;
      if (formData.photo) {
        try {
          photoUrl = await uploadPhoto(formData.photo);
        } catch (photoErr) {
          const continueWithoutPhoto = window.confirm(
            "Photo upload failed. Do you want to continue without the photo?"
          );
          if (!continueWithoutPhoto) {
            restoreButton();
            return;
          }
        }
      }

      // Check for existing reports
      try {
        const { data: check } = await API.get(`/reports/checkExisting`, {
          params: { category: finalCategory, lat: latitude, lng: longitude },
        });
        if (check?.count > 0) {
          const proceed = window.confirm(
            `Similar reports exist nearby (${check.count} found). Do you want to proceed anyway?`
          );
          if (!proceed) {
            restoreButton();
            return;
          }
        }
      } catch (checkErr) {
        // If check fails, continue anyway
        console.warn("Could not check existing reports:", checkErr);
      }

      // Submit the report
      console.log("Submitting report with data:", {
        category: finalCategory,
        hasPhoto: !!photoUrl,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      
      const { data } = await API.post(`/reports/create`, {
        category: finalCategory,
        description: formData.description,
        photoUrl: photoUrl,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        firebaseUid: uid || undefined,
        name: formData.name || undefined,
        contact: formData.contact || undefined,
        color: formData.color || undefined,
      });

      setSubmitted(true);
      alert(data?.message || "Report created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        contact: "",
        category: "",
        customCategory: "",
        color: "",
        description: "",
        photo: null,
        location: "",
      });
      
      // Reset file input
      const fileInput = e.target.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      
      restoreButton();
    } catch (err) {
      console.error("Submit error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to submit report. Please try again.";
      alert(msg);
      restoreButton();
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
