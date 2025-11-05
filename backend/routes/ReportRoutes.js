// backend/routes/ReportRoutes.js
import express from "express";
import {
  checkExistingReports,
  createReport,
  updateReport,
  trackMyStatus,
} from "../controllers/ReportController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/checkExisting", verifyUser, checkExistingReports);
router.post("/create", verifyUser, createReport);
router.put("/update/:id", verifyUser, updateReport);
router.get("/trackMyStatus", verifyUser, trackMyStatus);

export default router;
