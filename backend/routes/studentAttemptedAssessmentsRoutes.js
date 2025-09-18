const express = require("express");
const router = express.Router();
const {
  getAllStandardAttemptsForAdmin,
  getAllSatAttemptsForAdmin,
} = require("../controllers/studentAttemptedAssessmentsController");
const { protect } = require("../middlewares/authMiddleware");

// If only admins should view these, add `adminOnly`
router.get("/standard", protect, getAllStandardAttemptsForAdmin);
router.get("/sat", protect,  getAllSatAttemptsForAdmin);

module.exports = router;
