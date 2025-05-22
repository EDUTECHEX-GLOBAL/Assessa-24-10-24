const asyncHandler = require("express-async-handler");
const AssessmentUpload = require("../models/webapp-models/assessmentuploadformModel");
const AssessmentSubmission = require('../models/webapp-models/assessmentSubmissionModel');
const User = require("../models/webapp-models/userModel");
const { uploadToS3, getSignedUrl, deleteFromS3 } = require("../config/s3Upload");
const { parsePDFToQuestions } = require('../utils/pdfParser');

// @desc    Upload assessment and parse questions
// @route   POST /api/assessments/upload
// @access  Private (Teacher)
const uploadAssessment = asyncHandler(async (req, res) => {
  const { assessmentName, subject, gradeLevel, timeLimit } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400);
    throw new Error("File is required");
  }

  // Debug log user info
  console.log("uploadAssessment req.user:", req.user);

  // Verify teacher role
  if (!req.user || req.user.role !== "teacher") {
    res.status(403);
    throw new Error("Only teachers can upload assessments");
  }

  const { key } = await uploadToS3(file);

  // Parse PDF to extract questions
  const questions = await parsePDFToQuestions(file.buffer);
console.log("Parsed Questions:", questions);

if (!questions || questions.length === 0) {
  res.status(400);
  throw new Error("No questions extracted — please upload a valid PDF.");
}

  const assessment = await AssessmentUpload.create({
    teacherId: req.user._id,
    assessmentName,
    subject,
    gradeLevel,
    fileUrl: key,
    questions,
    timeLimit: timeLimit || 30,
  });

  res.status(201).json({
    message: "Assessment uploaded successfully",
    assessment,
  });
});


// @desc    Get assessments of logged in teacher
// @route   GET /api/assessments/my
// @access  Private (Teacher)
const getMyAssessments = asyncHandler(async (req, res) => {
  const assessments = await AssessmentUpload.find({ teacherId: req.user._id })
    .sort({ createdAt: -1 });

  const assessmentsWithUrls = await Promise.all(assessments.map(async (a) => ({
    ...a._doc,
    signedUrl: a.fileUrl ? await getSignedUrl(a.fileUrl) : null,
    submissionCount: await AssessmentSubmission.countDocuments({ assessmentId: a._id })
  })));

  res.json(assessmentsWithUrls);
});

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Teacher)
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

  // Delete from S3
  if (assessment.fileUrl) {
    try {
      await deleteFromS3(assessment.fileUrl);
    } catch (s3Error) {
      console.error("S3 Deletion Error:", s3Error);
      res.status(500);
      throw new Error('Failed to delete file from storage');
    }
  }

  // Delete all related submissions
  await AssessmentSubmission.deleteMany({ assessmentId: assessment._id });

  // Delete from database
  await assessment.deleteOne();

  res.json({ 
    message: 'Assessment deleted successfully',
    id: req.params.id 
  });
});

// @desc    Get all assessments (for students)
// @route   GET /api/assessments/all
// @access  Private (Student)
const getAllAssessments = async (req, res) => {
  try {
    const userId = req.user._id;

    const assessments = await AssessmentUpload.find().lean(); // plain JS objects

    const submissions = await AssessmentSubmission.find({
      studentId: userId,
    }).select("assessmentId score totalMarks");

    const submittedMap = {};
    submissions.forEach((s) => {
      submittedMap[s.assessmentId.toString()] = {
        score: s.score,
        totalMarks: s.totalMarks,
      };
    });

    const enriched = assessments.map((a) => ({
      ...a,
      submission: submittedMap[a._id.toString()] || null,
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assessments" });
  }
};

// @desc    Get assessment for attempt (without correct answers)
// @route   GET /api/assessments/:id/attempt
// @access  Private (Student)
const getAssessmentForAttempt = asyncHandler(async (req, res) => {
  const assessment = await AssessmentUpload.findById(req.params.id)
    .select('-questions.correctAnswer'); // Exclude correct answers

  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found');
  }

  // Check if student already submitted
  const existingSubmission = await AssessmentSubmission.findOne({
    assessmentId: assessment._id,
    studentId: req.user._id
  });

  if (existingSubmission) {
    res.status(400);
    throw new Error('You have already submitted this assessment');
  }

  res.json({
    ...assessment._doc,
    signedUrl: assessment.fileUrl ? await getSignedUrl(assessment.fileUrl) : null
  });
});

// @desc    Submit assessment answers
// @route   POST /api/assessments/:id/submit
// @access  Private (Student)
// @desc    Submit assessment answers
// @route   POST /api/assessments/:id/submit
// @access  Private (Student)
const submitAssessment = asyncHandler(async (req, res) => {
  const { answers, timeTaken } = req.body;
  const assessmentId = req.params.id;
  const studentId = req.user._id;

  const assessment = await AssessmentUpload.findById(assessmentId);
  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found');
  }

  const existingSubmission = await AssessmentSubmission.findOne({ assessmentId, studentId });
  if (existingSubmission) {
    res.status(400);
    throw new Error('You have already submitted this assessment');
  }

  if (!answers || answers.length !== assessment.questions.length) {
    res.status(400);
    throw new Error('Number of answers does not match number of questions');
  }

  let score = 0;

  const answerDetails = assessment.questions.map((question, index) => {
    const selectedOption = parseInt(answers[index]);
    const correctOption = parseInt(question.correctAnswer); // index of correct answer

    const isCorrect = selectedOption === correctOption;
    const marksObtained = isCorrect ? (question.marks || 1) : 0;

    score += marksObtained;

    return {
      questionId: question._id,
      questionText: question.questionText,
      selectedOption,
      correctOption,
      isCorrect,
      marksObtained
    };
  });

  const totalMarks = assessment.questions.reduce(
    (sum, q) => sum + (q.marks || 1), 0
  );

  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

  const submission = await AssessmentSubmission.create({
    assessmentId,
    studentId,
    answers: answerDetails,
    score,
    totalMarks,
    percentage,
    timeTaken
  });

  res.status(201).json({
    message: "Assessment submitted successfully",
    score: submission.score,
    totalMarks: submission.totalMarks,
    percentage: submission.percentage,
    timeTaken: submission.timeTaken,
    submittedAt: submission.createdAt,
  });
});



// @desc    Get all submissions for an assessment (Teacher view)
// @route   GET /api/assessments/:id/submissions
// @access  Private (Teacher)
const getAssessmentSubmissions = asyncHandler(async (req, res) => {
  const assessment = await AssessmentUpload.findById(req.params.id);
  
  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found');
  }

  // Verify teacher owns this assessment
  if (assessment.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view these submissions');
  }

  const submissions = await AssessmentSubmission.find({
    assessmentId: req.params.id
  }).populate('studentId', 'name email');

  res.json({
    assessment: {
      _id: assessment._id,
      assessmentName: assessment.assessmentName,
      totalQuestions: assessment.questions.length,
      totalMarks: assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0)
    },
    submissions
  });
});

module.exports = {
  uploadAssessment,
  getMyAssessments,
  deleteAssessment,
  getAllAssessments,
  getAssessmentForAttempt,
  submitAssessment,
  getAssessmentSubmissions
};