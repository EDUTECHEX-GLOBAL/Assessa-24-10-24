const express = require("express");
const {
  authAdmin,
  getApprovalRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/adminController");

const router = express.Router();

// Admin login route
router.post("/login", authAdmin);

// Approval management routes
router.get("/approvals", getApprovalRequests); // ?status=pending/approved/rejected
router.patch("/approvals/:id/approve", approveRequest);
router.patch("/approvals/:id/reject", rejectRequest);

module.exports = router;
