// backend/controllers/ReportController.js
import Report from "../models/ReportModel.js";
import mongoose from "mongoose";

/* GET /api/reports/checkExisting?category=Dog&lat=20.30&lng=85.82
 This is called right after the user fills the form — before deciding whether to create or update.
If results are shown, the user picks one (based on photo, description, etc).
*/
export const checkExistingReports = async (req, res) => {
  try {
    const { category, lat, lng } = req.query;

    const reports = await Report.find({
      category,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 3000, // within 300 meters
        },
      },
    }).populate("reportedBy", "name email");

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import Report from "../models/ReportModel.js";

/**
 * @desc Create a new animal report
 * @route POST /api/reports/create
 * @access Protected (User only)
 */
export const createReport = async (req, res) => {
  try {
    const { category, description, photoUrl, latitude, longitude } = req.body;
    const userId = req.user._id; // from JWT middleware

    // ✅ Validate essential fields
    if (!category || !latitude || !longitude) {
      return res.status(400).json({
        message: "Category, latitude, and longitude are required.",
      });
    }

    // 🐾 Create new report document
    const newReport = new Report({
      category,
      status: "Yet to be picked up",
      reportedBy: [userId],
      descriptions: [
        {
          text: description || "No description provided",
          addedBy: userId,
        },
      ],
      photos: photoUrl
        ? [
            {
              url: photoUrl,
              uploadedBy: userId,
            },
          ]
        : [],
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      history: [
        {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      ],
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "New report created successfully.",
      report: newReport,
    });
  } catch (error) {
    console.error("❌ Error in createReport:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// PUT /api/reports/update/:id
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, photoUrl, latitude, longitude } = req.body;
    const userId = req.user._id;

    const report = await Report.findById(id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });

    // 🧠 Push new description
    if (description) {
      report.descriptions.push({
        text: description,
        addedBy: userId,
      });
    }

    // 🖼️ Push new photos
    if (photoUrl && photoUrl.length > 0) {
      // photoUrl can be string or array
      const photosToAdd = Array.isArray(photoUrl) ? photoUrl : [photoUrl];
      photosToAdd.forEach((url) =>
        report.photos.push({ url, uploadedBy: userId })
      );
    }

    // 🧭 Add to report history (location tracking)
    if (latitude && longitude) {
      report.history.push({
        location: { type: "Point", coordinates: [longitude, latitude] },
      });
    }

    // Add this user as a reporter (if not already)
    if (!report.reportedBy.includes(userId)) {
      report.reportedBy.push(userId);
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reports/trackMyStatus
export const trackMyStatus = async (req, res) => {
  try {
    const reports = await Report.find({
      reportedBy: req.user._id,
    })
      .populate("reportedBy", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
