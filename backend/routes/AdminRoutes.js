import express from "express";
import { getAllReports, updateReportStatus } from "../controllers/AdminController.js";

const router = express.Router();

router.get("/reports", getAllReports);
router.put("/report/:id/status", updateReportStatus);

export default router;
