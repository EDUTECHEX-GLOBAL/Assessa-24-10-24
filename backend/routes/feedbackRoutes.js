const express = require("express");
const router = express.Router();
const {
  generateFeedback,
  getAllFeedbacks,
} = require("../controllers/feedbackController");

router.post("/send", generateFeedback); // changed to `/send`
router.get("/", getAllFeedbacks);

module.exports = router;
