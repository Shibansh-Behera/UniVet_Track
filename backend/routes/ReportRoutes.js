// backend/routes/ReportRoutes.js
import express from "express";
import multer from "multer";
import {
  checkExistingReports,
  createReport,
  updateReport,
  trackMyStatus,
  uploadPhoto,
} from "../controllers/ReportController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.get("/checkExisting", verifyUser, checkExistingReports);
router.post("/uploadPhoto", verifyUser, upload.single("photo"), uploadPhoto);
router.post("/create", verifyUser, createReport);
router.put("/update/:id", verifyUser, updateReport);
router.get("/trackMyStatus", verifyUser, trackMyStatus);

export default router;
