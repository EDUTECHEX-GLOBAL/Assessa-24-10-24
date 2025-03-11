// routes/progressRoutes.js
const express = require("express");
const router = express.Router();
const { getProgressData } = require("../controllers/progressController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/progress", protect, getProgressData);

module.exports = router;