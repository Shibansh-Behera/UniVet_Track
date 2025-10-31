import React, { useState } from "react";
import API from "../api/axios";

const ReportForm = ({ onReportCreated }) => {
  const [form, setForm] = useState({
    reporterName: "",
    contactNumber: "",
    category: "",
    color: "",
    description: "",
    photoUrl: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const location = {
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };

      const res = await API.post("/reports/report", { ...form, location });
      alert(res.data.message);
      onReportCreated(); // Refresh report list
    } catch (err) {
      console.error(err);
      alert("Failed to submit report");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg"
    >
      <h2 className="text-xl font-semibold mb-4 text-green-700">
        Report an Animal
      </h2>

      {["reporterName", "contactNumber", "category", "color", "description", "photoUrl", "latitude", "longitude"].map((field) => (
        <input
          key={field}
          type="text"
          name={field}
          placeholder={field.replace(/([A-Z])/g, " $1")}
          value={form[field]}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg w-full mb-3 p-2"
          required={field !== "photoUrl"}
        />
      ))}

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
      >
        Submit Report
      </button>
    </form>
  );
};

export default ReportForm;
