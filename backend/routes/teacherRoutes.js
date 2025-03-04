const express = require("express");
const router = express.Router();
const { registerTeacher, authTeacher, updateTeacherProfile } = require("../controllers/teacherController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", registerTeacher);
router.post("/login", authTeacher);
router.post("/profile", protect, updateTeacherProfile);

module.exports = router;