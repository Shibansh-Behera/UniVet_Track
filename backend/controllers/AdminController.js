import Report from "../models/ReportModel.js";

// 📋 List All Reports with Filters
export const getAllReports = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const reports = await Report.find(filter).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔄 Update Status
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Report.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ message: "Status updated", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
