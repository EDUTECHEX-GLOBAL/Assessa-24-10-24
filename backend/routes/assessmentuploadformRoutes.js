const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage(); // Required for S3 uploads
const upload = multer({ storage });

const { protect } = require("../middlewares/authMiddleware");
const {
  uploadAssessment,
  getMyAssessments,
} = require("../controllers/assessmentuploadformController");

router.post("/upload", protect, upload.single("file"), uploadAssessment);
router.get("/my", protect, getMyAssessments);

module.exports = router;
