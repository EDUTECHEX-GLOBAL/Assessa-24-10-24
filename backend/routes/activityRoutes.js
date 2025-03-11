// routes/activityRoutes.js
const express = require("express");
const router = express.Router();
const { getDailyActivity } = require("../controllers/activityController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/daily-activity", protect, getDailyActivity);

module.exports = router;
