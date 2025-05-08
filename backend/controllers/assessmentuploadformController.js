const asyncHandler = require("express-async-handler");
const AssessmentUpload = require("../models/webapp-models/assessmentuploadformModel");
const { uploadToS3, getSignedUrl, deleteFromS3 } = require("../config/s3Upload");

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

// 2. Add the delete controller (modified with S3 cleanup)
const deleteAssessment = asyncHandler(async (req, res) => {
  const assessment = await AssessmentUpload.findById(req.params.id);

  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found');
  }

  // Verify ownership
  if (assessment.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this assessment');
  }

  // New: Delete from S3
  if (assessment.fileUrl) {
    try {
      await deleteFromS3(assessment.fileUrl);
    } catch (s3Error) {
      console.error("S3 Deletion Error:", s3Error);
      res.status(500);
      throw new Error('Failed to delete file from storage');
    }
  }

  // Delete from database
  await assessment.deleteOne();

  res.json({ 
    message: 'Assessment deleted successfully',
    id: req.params.id 
  });
});

// Add to exports
module.exports = {
  uploadAssessment,
  getMyAssessments,
  deleteAssessment, // Add this line
};