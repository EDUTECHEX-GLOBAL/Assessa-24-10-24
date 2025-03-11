// controllers/progressController.js
const Progress = require("../models/webapp-models/progressModel");
const asyncHandler = require("express-async-handler");

const getProgressData = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const progressData = await Progress.find({ student: studentId });
  res.json(progressData);
});

module.exports = { getProgressData };