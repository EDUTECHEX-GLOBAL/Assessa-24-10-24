const express = require("express");
const {
  getGeneratedAssessmentCount,
  getStandardAssessments,
  getSatAssessments,
} = require("../controllers/generatedAssessmentCountController");

const router = express.Router();

// ✅ Counts
router.get("/count", getGeneratedAssessmentCount);

// ✅ Full list of Standard Assessments
router.get("/standard", getStandardAssessments);

// ✅ Full list of SAT Assessments
router.get("/sat", getSatAssessments);

module.exports = router;
