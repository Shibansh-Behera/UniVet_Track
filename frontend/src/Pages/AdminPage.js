import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useLocation } from "react-router-dom";



const AdminPage = () => {
  const [reports, setReports] = useState([]);
  const { state } = useLocation();
  const { uid, name, email, role } = state || {};

  const fetchReports = async () => {
    const res = await API.get("/admin/reports");
    setReports(res.data);
  };

  const updateStatus = async (id, newStatus) => {
    await API.put(`/admin/report/${id}/status`, { status: newStatus });
    fetchReports();
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    
    <div className="min-h-screen bg-blue-50 p-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">🛠 Admin Dashboard</h1>
      <h1>Welcome, {name} ({role})</h1>
      <p>Email: {email}</p>
      <p>UID: {uid}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r._id} className="bg-white p-4 rounded shadow">
            <p><strong>{r.category}</strong> ({r.color})</p>
            <p>Status: <span className="text-green-600">{r.status}</span></p>
            <div className="mt-2 space-x-2">
              {["yet to be picked", "picked up", "in treatment", "treated"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(r._id, s)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
