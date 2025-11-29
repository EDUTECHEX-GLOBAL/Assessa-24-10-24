const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/authMiddleware");

const {
  generateDailyQuizzes,
  getTodayQuiz,
  submitTodayQuiz,
  getDailyQuizScore
} = require("../../controllers/dailyQuizController");
router.get("/today", protect, getTodayQuiz);
router.post("/submit", protect, submitTodayQuiz);
router.get("/score", protect, getDailyQuizScore);

module.exports = router;
