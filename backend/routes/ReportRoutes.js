import express from "express"
import { createOrUpdateReport, getReports, getNearbyReports, markReportAsSeen, getMyReports } from "../controllers/ReportController.js"
import { verifyUserToken } from "../middleware/authMiddleware.js"

const reportRouter = express.Router()

reportRouter.post("/report", verifyUserToken, createOrUpdateReport)
reportRouter.get("/", verifyUserTokengetReports)
reportRouter.get("/nearby", verifyUserTokengetNearbyReports) 
reportRouter.get("/my-reports", verifyUserToken, getMyReports)

// New route
reportRouter.patch("/:id/mark-seen", verifyUserTokenmarkReportAsSeen)

export default reportRouter 
