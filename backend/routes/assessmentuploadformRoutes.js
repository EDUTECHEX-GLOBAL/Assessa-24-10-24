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
  // Add the new controllers:
  getAssessmentLibraryCount,
  getUploadedAssessmentsCount,
  getNewThisWeekCount,
  getStudentProgress,
  getStudentProgressForTeacher,
  getTeacherProgress,
} = require("../controllers/assessmentuploadformController");

// --- Add your test route here ---
router.get("/test", (req, res) => res.json({ ok: true, message: "Test route is working!" }));

// Dashboard count endpoints
router.get("/library/count", protect, getAssessmentLibraryCount); // Total in library
router.get("/uploaded/count", protect, getUploadedAssessmentsCount); // Uploaded by teacher
router.get("/library/new-this-week/count", protect, getNewThisWeekCount); // New this week

// Teacher routes
router.post("/upload", protect, upload.single("file"), uploadAssessment);
router.get("/my", protect, getMyAssessments);
router.delete("/:id", protect, deleteAssessment);
router.get("/:id/submissions", protect, getAssessmentSubmissions); // Teacher views submissions

// Student routes
router.get("/all", protect, getAllAssessments); // Students can view all assessments
router.get("/progress", protect, getStudentProgress);
router.get("/teacher/student-progress", protect, getStudentProgressForTeacher);
router.get("/teacher-progress", protect, getTeacherProgress);

router.get("/:id/attempt", protect, getAssessmentForAttempt); // Get assessment for attempt
router.post("/:id/submit", protect, submitAssessment); // Submit assessment answers

module.exports = router;
