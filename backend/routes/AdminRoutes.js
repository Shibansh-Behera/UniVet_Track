import express from "express"
import { getAllReports, deleteReport, updateReportStatus } from "../controllers/AdminController.js"
import { verifyAdmin } from "../middleware/authMiddleware.js"

const adminRouter = express.Router()

// Fetch all reports
adminRouter.get("/reports", verifyAdmin, getAllReports)

// Delete report
adminRouter.delete("/reports/:id", verifyAdmin, deleteReport)

// Update report status
adminRouter.put("/reports/:id/status", verifyAdmin, updateReportStatus)

export default adminRouter
