import express from "express";
import { reportAnimal, getReportStatus } from "../controllers/ReportController.js";

const router = express.Router();

router.post("/report", reportAnimal);
router.get("/status", getReportStatus);

export default router;
