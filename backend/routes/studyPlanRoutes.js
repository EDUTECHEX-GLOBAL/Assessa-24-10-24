const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getStudyPlan,
  getPracticeQuestions,
  updateStudyTask,
  getStudyProgress
} = require("../controllers/studyPlanController");

router.get("/:studentId", protect, getStudyPlan);
router.get("/practice-questions/:topic", protect, getPracticeQuestions);
router.put("/task/:taskId", protect, updateStudyTask);
router.get("/progress/:studentId", protect, getStudyProgress);

module.exports = router;
