const express = require("express");
const router = express.Router();
const { getTasks } = require("../controllers/taskController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/tasks", protect, getTasks);

module.exports = router;
