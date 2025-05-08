const asyncHandler = require("express-async-handler");
const Admin = require("../models/webapp-models/adminModel");
const User = require("../models/webapp-models/userModel");
const Teacher = require("../models/webapp-models/teacherModel");
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


module.exports = {
  authAdmin,
  getApprovalRequests,
  approveRequest,
  rejectRequest,
  getApprovalCounts, // Add this line
};
