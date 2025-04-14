const asyncHandler = require("express-async-handler");
const AssessmentUpload = require("../models/webapp-models/assessmentuploadformModel");
const uploadToS3 = require("../config/s3Upload"); // You should have this configured

// @desc    Upload assessment
// @route   POST /api/assessments/upload
// @access  Private
const uploadAssessment = asyncHandler(async (req, res) => {
  const { assessmentName, subject, gradeLevel } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400);
    throw new Error("File is required");
  }

  const { key } = await uploadToS3(file); // destructure just the key

  const assessment = await AssessmentUpload.create({
    teacherId: req.user._id,
    assessmentName,
    subject,
    gradeLevel,
    fileUrl: key, // ✅ this is now a string
  });

  res.status(201).json({
    message: "Assessment uploaded successfully",
    assessment,
  });
});

// @desc    Get assessments of logged in teacher
// @route   GET /api/assessments/my
// @access  Private
const getMyAssessments = asyncHandler(async (req, res) => {
  const assessments = await AssessmentUpload.find({ teacherId: req.user._id });

  const assessmentsWithUrls = assessments.map((a) => ({
    ...a._doc,
    signedUrl: getSignedUrl(a.fileUrl),
  }));

  res.json(assessmentsWithUrls);
});

module.exports = {
  uploadAssessment,
  getMyAssessments,
};
