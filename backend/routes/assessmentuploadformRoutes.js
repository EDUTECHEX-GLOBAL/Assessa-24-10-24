const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage(); // Required for S3 uploads
const upload = multer({ storage });

const { protect } = require("../middlewares/authMiddleware");
const {
  uploadAssessment,
  getMyAssessments,
  deleteAssessment, // Import the new controlle
} = require("../controllers/assessmentuploadformController");

router.post("/upload", protect, upload.single("file"), uploadAssessment);
router.get("/my", protect, getMyAssessments);

// New delete route
router.delete("/:id", protect, deleteAssessment);

module.exports = router;
