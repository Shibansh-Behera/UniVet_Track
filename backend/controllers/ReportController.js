// backend/controllers/ReportController.js
import Report from "../models/ReportModel.js";
import haversine from "haversine-distance"; // optional, for accurate sorting

export const createOrUpdateReport = async (req, res) => {
  try {
    const { reporterName, contactNumber, category, description, photoUrl, location } = req.body;
    const forceCreate = req.query.force === "true";

    if (!category || !location?.lat || !location?.lon) {
      return res.status(400).json({ message: "category and location required" });
    }

    const lon = parseFloat(location.lon);
    const lat = parseFloat(location.lat);
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const RADIUS_METERS = 1000;

    if (!forceCreate) {
      // find same category reports in last 3 hours within 1 km
      const nearbyReports = await Report.find({
        category,
        createdAt: { $gte: threeHoursAgo },
        location: {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: [lon, lat] },
            $maxDistance: RADIUS_METERS,
          },
        },
      });

      // find all category reports (sorted by distance)
      const allCategoryReports = await Report.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lon, lat] },
            distanceField: "distanceMeters",
            spherical: true,
            query: { category },
          },
        },
        { $sort: { distanceMeters: 1 } },
      ]);

      if (nearbyReports.length > 0) {
        return res.status(200).json({
          duplicatePossible: true,
          message: "Similar animals found nearby — please check before creating new report",
          nearbyReports,
          allCategoryReports,
        });
      }
    }

    // create new report (force=true or no duplicates)
    const report = new Report({
      reporterName,
      contactNumber,
      category,
      description,
      photoUrl,
      location: { type: "Point", coordinates: [lon, lat] },
      history: [{ location: { type: "Point", coordinates: [lon, lat] } }],
    });
    await report.save();

    res.status(201).json({ duplicatePossible: false, message: "Report created", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get all reports — optionally filter by category or status
 */
export const getReports = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const reports = await Report.find(filter).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get nearby reports for user — sorted by distance
 * Show all same-category reports, closest ones first
 */
export const getNearbyReports = async (req, res) => {
  try {
    const { lat, lon, category, radius = 5000 } = req.query; // radius in meters

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    // Geo query with sorting by distance (MongoDB does this automatically)
    const query = {
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    };

    if (category) query.category = category;

    const reports = await Report.find(query).limit(50);

    return res.status(200).json({
      count: reports.length,
      message: `Found ${reports.length} nearby ${category ? category : ""} reports`,
      reports
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const reports = await Report.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.status(200).json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user reports" });
  }
};


// Mark a report as resolved
export const markReportAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = "resolved";
    await report.save();

    res.json({ success: true, message: "Report marked as seen/resolved", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
