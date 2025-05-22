const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage(); // Required for S3 uploads
const upload = multer({ storage });

const { protect } = require("../middlewares/authMiddleware");
const {
  uploadAssessment,
  getMyAssessments,
  deleteAssessment,
  getAllAssessments,
  submitAssessment,
  getAssessmentForAttempt, // Import the new controller
  getAssessmentSubmissions, // New controller for teacher to view submissions
} = require("../controllers/assessmentuploadformController");

// Teacher routes
router.post("/upload", protect, upload.single("file"), uploadAssessment);
router.get("/my", protect, getMyAssessments);
router.delete("/:id", protect, deleteAssessment);
router.get("/:id/submissions", protect, getAssessmentSubmissions); // Teacher views submissions

// Student routes
router.get("/all", protect, getAllAssessments); // Students can view all assessments
router.get("/:id/attempt", protect, getAssessmentForAttempt); // Get assessment for attempt
router.post("/:id/submit", protect, submitAssessment); // Submit assessment answers

module.exports = router;