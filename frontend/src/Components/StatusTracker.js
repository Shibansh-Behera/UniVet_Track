import React, { useEffect, useState } from "react";
import API from "../api/axios";

const StatusTracker = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    const { data } = await API.get("/reports/trackMyStatus");
    setReports(data?.reports || []);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="mt-10 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4 text-green-700">
        Track Report Status
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {reports.map((r) => (
          <div key={r._id} className="border rounded-lg p-4 bg-white shadow">
            <p><strong>Category:</strong> {r.category}</p>
            <p><strong>Status:</strong> <span className="font-medium text-blue-600">{r.status}</span></p>
            {r?.location?.coordinates && (
              <p><strong>Location:</strong> {r.location.coordinates[1]}, {r.location.coordinates[0]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTracker;
