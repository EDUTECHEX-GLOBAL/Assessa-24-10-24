const asyncHandler = require("express-async-handler");

// Models
const Admin = require("../models/webapp-models/adminModel");
const User = require("../models/webapp-models/userModel");
const Teacher = require("../models/webapp-models/teacherModel");
const AssessmentUpload = require("../models/webapp-models/assessmentuploadformModel"); // ✅ ADDED
const SatAssessment = require("../models/webapp-models/satAssessmentModel");           // ✅ ADDED
const AssessmentSubmission = require("../models/webapp-models/assessmentSubmissionModel");
const SatSubmission = require("../models/webapp-models/satSubmissionModel");

// Controllers / Utilities
const { createAdminNotification } = require("./adminNotificationController");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/mailer");



// Admin login
const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(400).json({ message: "Invalid Email or Password!" });
  }

  res.json({
    _id: admin._id,
    email: admin.email,
    token: generateToken(admin._id),
  });
});

// Get approval requests (students + teachers)
const getApprovalRequests = asyncHandler(async (req, res) => {
  const status = req.query.status;
  let filter = {};
  if (["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const students = await User.find(filter).lean();
  const teachers = await Teacher.find(filter).lean();

  const merged = [
    ...students.map((user) => ({ ...user, role: "student" })),
    ...teachers.map((teacher) => ({ ...teacher, role: "teacher" })),
  ];

  // Sort by creation date (newest first)
  merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(merged);
});

// Approve user or teacher
const approveRequest = asyncHandler(async (req, res) => {
  const { role } = req.body;

  let account;
  if (role === "teacher") {
    account = await Teacher.findById(req.params.id);
  } else {
    account = await User.findById(req.params.id);
  }

  if (!account) return res.status(404).json({ message: `${role} not found` });

  account.status = "approved";
  account.isAdminApproved = true;
  await account.save();

  // Create notification for approval
  await createAdminNotification(req.user._id, {
    type: "approval_approved",
    title: `${role.charAt(0).toUpperCase() + role.slice(1)} Approved`,
    message: `${account.name} (${account.email}) has been approved`,
    data: {
      userId: account._id,
      role: role,
    },
    priority: "medium",
  });

  await sendEmail.sendApprovalEmail(account.email, account.name, role);

  res.json({ message: `${role} approved successfully` });
});

// Reject user or teacher
const rejectRequest = asyncHandler(async (req, res) => {
  const { reason, role } = req.body;

  let account;
  if (role === "teacher") {
    account = await Teacher.findById(req.params.id);
  } else {
    account = await User.findById(req.params.id);
  }

  if (!account) return res.status(404).json({ message: `${role} not found` });

  account.status = "rejected";
  account.rejectionReason = reason;
  account.isAdminApproved = false;
  await account.save();

  // Create notification for rejection
  await createAdminNotification(req.admin._id, {
    type: "approval_rejected",
    title: `${role.charAt(0).toUpperCase() + role.slice(1)} Rejected`,
    message: `${account.name} (${account.email}) has been rejected. Reason: ${reason}`,
    data: {
      userId: account._id,
      role: role,
    },
    priority: "medium",
  });

  await sendEmail.sendRejectionEmail(account.email, account.name, reason);

  res.json({ message: `${role} rejected successfully` });
});

// Get pending approval counts only
const getApprovalCounts = asyncHandler(async (req, res) => {
  const studentCount = await User.countDocuments({ status: 'pending' });
  const teacherCount = await Teacher.countDocuments({ status: 'pending' });

  res.json({
    total: studentCount + teacherCount,
    students: studentCount,
    teachers: teacherCount,
  });
});

// Get overall dashboard stats (teachers + users + engagement)
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Teachers
    const totalTeachers = await Teacher.countDocuments();
    const approvedTeachers = await Teacher.countDocuments({ status: "approved" });
    const pendingTeachers = await Teacher.countDocuments({ status: "pending" });
    const rejectedTeachers = await Teacher.countDocuments({ status: "rejected" });
    const inactiveTeachers = pendingTeachers + rejectedTeachers;

    // Users (students)
    const totalUsers = await User.countDocuments();
    const approvedUsers = await User.countDocuments({ status: "approved" });
    const pendingUsers = await User.countDocuments({ status: "pending" });

   // ----- ENGAGEMENT FIX ----- 

// Attendance Rate = Approved Students / Total Students
let attendanceRate = 0;
if (totalUsers > 0) {
  attendanceRate = ((approvedUsers / totalUsers) * 100);
}

// ----- PARTICIPATION RATE ----- 
const standardParticipants = await AssessmentSubmission.distinct("studentId");
const satParticipants = await SatSubmission.distinct("studentId");

// unique student IDs only
const uniqueParticipants = new Set([
  ...standardParticipants.map(id => id.toString()),
  ...satParticipants.map(id => id.toString())
]);

let participationRate = 0;
if (totalUsers > 0) {
  participationRate = ((uniqueParticipants.size / totalUsers) * 100);
}

// prevent >100%
attendanceRate = Math.min(attendanceRate, 100);
participationRate = Math.min(participationRate, 100);

// overall engagement (average)
let overallEngagement = (attendanceRate + participationRate) / 2;

// round values
attendanceRate = attendanceRate.toFixed(2);
participationRate = participationRate.toFixed(2);
overallEngagement = overallEngagement.toFixed(2);


    res.json({
      teachers: {
        total: totalTeachers,
        active: approvedTeachers,
        inactive: inactiveTeachers,
      },
      users: {
        total: totalUsers,
        active: approvedUsers,
        pending: pendingUsers,
      },
      engagement: {
        attendanceRate,
        participationRate,
        overallEngagement
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});


// Get all teachers
const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().lean();
  res.json(teachers);
});

// Get all students
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find().lean();
  res.json(students);
});

// Delete teacher or student
const deleteAccount = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (role === "teacher") {
    await Teacher.findByIdAndDelete(req.params.id);
    return res.json({ message: "Teacher deleted successfully" });
  } else {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: "Student deleted successfully" });
  }
});

// Toggle access (grant/revoke after approval)
const toggleAccess = asyncHandler(async (req, res) => {
  const { role, action } = req.body;

  let account;
  if (role === "teacher") {
    account = await Teacher.findById(req.params.id);
  } else {
    account = await User.findById(req.params.id);
  }

  if (!account) return res.status(404).json({ message: `${role} not found` });

  if (action === "grant") {
    account.status = "approved";
    account.isAdminApproved = true;
  } else if (action === "revoke") {
    account.status = "inactive";
    account.isAdminApproved = false;
  }

  await account.save();
  res.json({ message: `${role} access ${action}ed successfully` });
});

// ================================
// 🟡 Teacher Highlights (Top Uploaders)
// ================================
const getTeacherHighlights = asyncHandler(async (req, res) => {
  try {
    // 1️⃣ Fetch all teachers
    const teachers = await Teacher.find({ status: "approved" }).lean();

    // 2️⃣ Fetch standard assessment counts (approved only)
    const standardCounts = await AssessmentUpload.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: "$teacherId", count: { $sum: 1 } } }
    ]);

    // 3️⃣ Fetch SAT assessment counts (approved only)
    const satCounts = await SatAssessment.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: "$teacherId", count: { $sum: 1 } } }
    ]);

    // Convert to map for fast lookups
    const standardMap = {};
    standardCounts.forEach(s => standardMap[s._id] = s.count);

    const satMap = {};
    satCounts.forEach(s => satMap[s._id] = s.count);

    // 4️⃣ Prepare final data
    const highlights = teachers.map(t => {
      const standard = standardMap[t._id] || 0;
      const sat = satMap[t._id] || 0;

      return {
        name: t.name,
        teacherId: t._id,
        standard,
        sat,
        uploads: standard + sat
      };
    });

    // 5️⃣ Sort by uploads descending
    highlights.sort((a, b) => b.uploads - a.uploads);

    // 6️⃣ Return top 3
    res.json(highlights.slice(0, 3));

  } catch (error) {
    console.error("Error fetching teacher highlights:", error);
    res.status(500).json({ message: "Failed to load teacher highlights" });
  }
});

// ================================
// 🔵 Recent Assessments (Standard + SAT) — FIXED
// ================================
const getRecentAssessments = asyncHandler(async (req, res) => {
  try {
    // Latest Standard assessments
    const standard = await AssessmentUpload.find({ isApproved: true })
      .populate("teacherId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Latest SAT assessments
    const sat = await SatAssessment.find({ isApproved: true })
      .populate("teacherId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Merge both sets and sort
    const merged = [...standard, ...sat]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Format response
    const formatted = merged.map(a => ({
      title: a.assessmentName || a.satTitle || "Assessment",
      type: a.satTitle ? "SAT" : "Standard",
      subject: a.subject || a.sectionType || "General",
      teacherName: a.teacherId?.name || "Unknown",
      uploadedAgo: a.createdAt ? timeAgo(a.createdAt) : "Unknown"
    }));

    res.json(formatted);

  } catch (err) {
    console.error("Recent assessments error:", err);
    res.status(500).json({ message: "Failed to fetch assessments" });
  }
});




module.exports = {
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
  getTeacherHighlights,
  getRecentAssessments
};
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) {
      return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}
