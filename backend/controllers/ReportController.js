import Report from "../models/ReportModel.js";

// 🐾 Create or Update Report
export const reportAnimal = async (req, res) => {
  try {
    const { reporterName, contactNumber, category, color, description, location, photoUrl } = req.body;

    // Find duplicates from last 3 hours (based on category + color)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const nearbyReports = await Report.find({
      category,
      color,
      createdAt: { $gte: threeHoursAgo }
    });

    if (nearbyReports.length > 0) {
      // Assume first match → update location history
      const existing = nearbyReports[0];
      existing.history.push({ latitude: location.latitude, longitude: location.longitude });
      await existing.save();
      return res.json({ message: "Existing report updated with new location", existing });
    }

    // No duplicate → create new report
    const newReport = new Report({
      reporterName,
      contactNumber,
      category,
      color,
      description,
      photoUrl,
      location,
      history: [{ latitude: location.latitude, longitude: location.longitude }]
    });

    await newReport.save();
    res.status(201).json({ message: "Report created successfully", newReport });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🩺 Track Animal Status
export const getReportStatus = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
