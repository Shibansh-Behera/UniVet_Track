import express from "express"
import { createOrUpdateReport, getReports, getNearbyReports, markReportAsSeen, getMyReports } from "../controllers/ReportController.js"
import { verifyUserToken } from "../middleware/authMiddleware.js"

const reportRouter = express.Router()

reportRouter.post("/report", verifyUserToken, createOrUpdateReport)
reportRouter.get("/", verifyUserToken, getReports)
reportRouter.get("/nearby", verifyUserToken, getNearbyReports) 
reportRouter.get("/my-reports", verifyUserToken, getMyReports)

// New route
reportRouter.patch("/:id/mark-seen", verifyUserToken, markReportAsSeen)

export default reportRouter 
