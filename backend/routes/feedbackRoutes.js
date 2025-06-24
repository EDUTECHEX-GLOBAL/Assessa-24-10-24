const express = require("express");
const router = express.Router();

const {
  generateFeedback,
  getAllFeedbacks,
} = require("../controllers/feedbackController");

// POST to generate and save AI-based feedback
router.post("/send", generateFeedback);

// GET all feedback entries
router.get("/", getAllFeedbacks);

module.exports = router;
