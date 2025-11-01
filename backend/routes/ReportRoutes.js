import express from "express";
import {
  createOrUpdateReport,
  getReports,
  getNearbyReports,
  markReportAsSeen, // ⬅️ Add this
} from "../controllers/ReportController.js";

const router = express.Router();

router.post("/report", createOrUpdateReport);
router.get("/", getReports);
router.get("/nearby", getNearbyReports);

// ✅ New route
router.patch("/:id/mark-seen", markReportAsSeen);

export default router;
