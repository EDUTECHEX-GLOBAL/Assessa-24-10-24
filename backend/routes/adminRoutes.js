const express = require("express");
const {
  authAdmin,
  getApprovalRequests,
  approveRequest,
  rejectRequest,
  getApprovalCounts,
  getDashboardStats,
  getAllTeachers,
  getAllStudents,
  deleteAccount,
  toggleAccess,
} = require("../controllers/adminController");

const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getTeacherHighlights } = require("../controllers/adminController");
const { getRecentAssessments } = require("../controllers/adminController");
// Admin login
router.post("/login", authAdmin);

// Approval management
router.get("/approvals", getApprovalRequests);
router.patch("/approvals/:id/approve", approveRequest);
router.patch("/approvals/:id/reject", rejectRequest);
router.get("/approvals/counts", getApprovalCounts);
router.get("/dashboard/recent-assessments", protect, getRecentAssessments);
// Dashboard stats
router.get("/dashboard/stats", getDashboardStats);

// Admin controlling (teachers & students)
router.get("/teachers", getAllTeachers);
router.get("/students", getAllStudents);
router.delete("/:id", deleteAccount);         // body: { role: "teacher" | "student" }
router.patch("/:id/toggle", toggleAccess);    // body: { role, action: "grant" | "revoke" }
router.get("/dashboard/teacher-highlights", protect, getTeacherHighlights);

module.exports = router;
