import express from "express"
import { getAllReports, deleteReport, updateReportStatus } from "../controllers/AdminController.js"
import { verifyAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

// Fetch all reports
router.get("/reports", verifyAdmin, getAllReports)

// Delete report
router.delete("/reports/:id", verifyAdmin, deleteReport)

// Update report status
router.put("/reports/:id/status", verifyAdmin, updateReportStatus)

export default router
