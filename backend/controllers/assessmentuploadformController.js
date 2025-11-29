const asyncHandler = require("express-async-handler");
const AssessmentUpload = require("../models/webapp-models/assessmentuploadformModel");
const AssessmentSubmission = require('../models/webapp-models/assessmentSubmissionModel');
const User = require("../models/webapp-models/userModel");
const { uploadToS3, getSignedUrl, deleteFromS3 } = require("../config/s3Upload");
const { parsePDFToQuestions } = require('../utils/pdfParser');
const Feedback = require("../models/webapp-models/FeedbackModel");
const { generateScoreReportPDF } = require("../utils/scoreReport");
const sendEmail = require("../utils/mailer");
const Notification = require("../models/webapp-models/notificationModel");
const TeacherNotificationController = require("../controllers/teacherNotificationController");


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

  if (!req.user || req.user.role !== "teacher") {
    res.status(403);
    throw new Error("Only teachers can upload assessments");
  }

  // 🛑 Prevent duplicates — look for existing assessments with SAME teacher + SAME fields
  const existing = await AssessmentUpload.find({
    teacherId: req.user._id,
    assessmentName: assessmentName.trim(),
    subject: subject.trim(),
    gradeLevel: gradeLevel.trim(),
  });

  if (existing.length >= 4) {
    return res.status(400).json({
      message: "This assessment already exists with all difficulty levels.",
    });
  }

  // Upload file to S3
  const { key } = await uploadToS3(file);

  // Parse questions from PDF
  const questions = await parsePDFToQuestions(file.buffer);
  if (!questions || questions.length === 0) {
    res.status(400);
    throw new Error("No questions extracted or generated.");
  }

  // Create missing difficulties only (in case some exist already)
  const allDifficulties = ["easy", "medium", "hard", "very hard"];
  const existingDiffs = existing.map((a) => a.difficulty);
  const difficultiesToCreate = allDifficulties.filter(
    (d) => !existingDiffs.includes(d)
  );

  const created = [];

  for (const difficulty of difficultiesToCreate) {
    const assessment = await AssessmentUpload.create({
      teacherId: req.user._id,
      assessmentName: assessmentName.trim(),
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim(),
      fileUrl: key,
      questions,
      timeLimit: timeLimit || 30,
      difficulty,
      isApproved: false,
    });
    created.push(assessment);
  }

  res.status(201).json({
    message: "Assessment uploaded successfully",
    createdCount: created.length,
    created,
  });
});

//approve assessment controller
const approveAssessment = asyncHandler(async (req, res) => {
  const assessment = await AssessmentUpload.findById(req.params.id);

  if (!assessment) {
    res.status(404);
    throw new Error("Assessment not found");
  }

  if (assessment.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to approve this assessment");
  }

  assessment.isApproved = true;
  await assessment.save();

  // NEW: Create notifications for students when assessment is approved
  try {
    // Find all students in the same grade level
   const students = await User.find({ 
  role: 'student', 
  class: assessment.gradeLevel 
   }).select('_id');

    if (students.length > 0) {
      const notifications = students.map(student => ({
        studentId: student._id,
        title: `New ${assessment.subject} Assessment`,
        message: `New ${assessment.assessmentName} has been assigned to you. Check your assessments.`,
        type: 'assessment_assigned',
        metadata: {
          subject: assessment.subject,
          dueDate: null, // You can add due date logic if needed
          assessmentId: assessment._id,
          assessmentType: 'standard'
        }
      }));

      // Bulk insert notifications
      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for grade ${assessment.gradeLevel}`);
    }
  } catch (notificationError) {
    console.error('Error creating notifications:', notificationError);
    // Don't throw error - assessment approval should still succeed
  }

  res.json({ message: "Assessment approved", status: assessment.isApproved });
});

//Assessment Review controller
const getAssessmentForReview = asyncHandler(async (req, res) => {
  const assessment = await AssessmentUpload.findById(req.params.id);

  if (!assessment) {
    res.status(404);
    throw new Error("Assessment not found");
  }

  if (assessment.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  res.json(assessment);
});

//assessment update controller
const updateAssessmentQuestions = asyncHandler(async (req, res) => {
  const { questions } = req.body;
  const assessment = await AssessmentUpload.findById(req.params.id);

  if (!assessment) {
    res.status(404);
    throw new Error("Assessment not found");
  }

  if (assessment.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  assessment.questions = questions;
  await assessment.save();

  res.json({ message: "Questions updated", assessment });
});


// @desc    Get assessments of logged in teacher
// @route   GET /api/assessments/my
// @access  Private (Teacher)
const getTeacherAssessments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { teacherId: req.user._id };

  // Apply status-based filtering
  if (status === "pending") {
    filter.isApproved = false;
  } else if (status === "approved") {
    filter.isApproved = true;
  }

  const assessments = await AssessmentUpload.find(filter).sort({ createdAt: -1 });

  const assessmentsWithUrls = await Promise.all(
    assessments.map(async (a) => ({
      ...a._doc,
      signedUrl: a.fileUrl ? await getSignedUrl(a.fileUrl) : null,
      submissionCount: await AssessmentSubmission.countDocuments({ assessmentId: a._id }),
    }))
  );

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
    const userRole = req.user.role;

    let assessmentsQuery = {};

    // Only students require grade-level filtering
    if (userRole === "student") {
      let studentClass = req.user.class; // Could be "10", "10th", "Class 10", etc.

      // Normalize student class safely
      let normalizedClass = "";

      if (studentClass) {
        normalizedClass = String(studentClass)
          .toLowerCase()
          .replace(/class/g, "")      // remove "class"
          .replace(/th/g, "")         // remove "th"
          .replace(/[^\d]/g, "")      // keep only digits
          .trim();
      }

      // Validate final class — fallback to 10
      if (!["9", "10", "11", "12"].includes(normalizedClass)) {
        console.warn("Invalid student class detected → defaulting to 10");
        normalizedClass = "10";
      }

      // Final query for students
      assessmentsQuery = {
        gradeLevel: normalizedClass,
        isApproved: true,
      };
    }

    // Fetch assessments
    const assessments = await AssessmentUpload.find(assessmentsQuery).lean();

    // Fetch user's submissions
    const submissions = await AssessmentSubmission.find({
      studentId: userId,
    }).select("assessmentId score totalMarks");

    // Map submissions for quick lookup
    const submittedMap = {};
    submissions.forEach((s) => {
      submittedMap[s.assessmentId.toString()] = {
        score: s.score,
        totalMarks: s.totalMarks,
      };
    });

    // Attach submission status to each assessment
    const enriched = assessments.map((a) => ({
      ...a,
      submission: submittedMap[a._id.toString()] || null,
    }));

    return res.json(enriched);

  } catch (err) {
    console.error("Error fetching assessments:", err);
    return res.status(500).json({ message: "Failed to fetch assessments" });
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

  // 💡 New rich responses array
  const responses = assessment.questions.map((question, index) => {
    const studentAnswer = parseInt(answers[index]);
    const correctAnswer = parseInt(question.correctAnswer);
    const isCorrect = studentAnswer === correctAnswer;
    const marks = question.marks || 1;

    if (isCorrect) score += marks;

    return {
      questionText: question.questionText,
      options: question.options,
      correctAnswer,
      studentAnswer,
      isCorrect,
      marks,
      topic: question.topic || "", // optional
    };
  });

  const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

  const submission = await AssessmentSubmission.create({
    assessmentId,
    studentId,
    responses, // ✅ store full data
    score,
    totalMarks,
    percentage: parseFloat(percentage.toFixed(2)),
    timeTaken,
  });
  
  // ✅ Generate PDF + Send Email
  try {
  const student = await User.findById(studentId).select("name email");
  if (student && student.email) {
    const pdfBuffer = await generateScoreReportPDF(
      submission,
      student,
      assessment,
      "standard"
    );

    await sendEmail.sendScoreReportEmail(
      student.email,
      student.name || "Student",
      pdfBuffer,
      "standard"
    );
  } else {
    console.warn("⚠️ Student email not found; skipping score report send.");
  }
} catch (err) {
  console.error("❌ Failed to generate/send standard score report:", err);
  // Don't throw → keep submission success even if email fails
}
 // 🔔 Create a teacher notification when a student submits (PASTE HERE)
try {
  const teacherId = assessment.teacherId;
  const student = await User.findById(studentId).select("name");

  if (teacherId) {
    await TeacherNotificationController.createAssessmentSubmissionNotification(teacherId, {
      studentName: student?.name || "Student",
      studentId,
      assessmentName: assessment.assessmentName || "Assessment",
      assessmentId: assessment._id,
      submittedAt: new Date(),
      subject: assessment.subject || "General",
      gradeLevel: assessment.gradeLevel || ""
    });
  } else {
    console.warn("⚠️ No teacherId on assessment; skipping teacher notification.");
  }
} catch (notifErr) {
  console.error("❌ Failed to create teacher submission notification:", notifErr);
}


  res.status(201).json({
    message: "Assessment submitted successfully",
    score: submission.score,
    totalMarks: submission.totalMarks,
    percentage: submission.percentage,
    timeTaken: submission.timeTaken,
    submittedAt: submission.createdAt,
    submissionId: submission._id
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
// Get total count of assessments in the library
const getAssessmentLibraryCount = async (req, res) => {
  try {
    const count = await AssessmentUpload.countDocuments({ teacherId: req.user._id });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching assessment library count" });
  }
};


// Get count of assessments uploaded by the logged-in teacher
const getUploadedAssessmentsCount = async (req, res) => {
  try {
    const count = await AssessmentUpload.countDocuments({ teacherId: req.user._id });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching uploaded assessments count" });
  }
};

// Get count of new assessments added this week
const getNewThisWeekCount = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const count = await AssessmentUpload.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching new this week count" });
  }
};

// @desc    Get progress for logged-in student
// @route   GET /api/assessments/progress
// @access  Private (Student)
const getStudentProgress = asyncHandler(async (req, res) => {
  if (req.user.role !== "student") {
    res.status(403);
    throw new Error("Only students can access their progress");
  }

  const submissions = await AssessmentSubmission.find({ studentId: req.user._id })
    .populate("assessmentId", "assessmentName createdAt")
    .sort({ submittedAt: -1 });

  const progressData = submissions.map((s) => ({
    assessmentTitle: s.assessmentId?.assessmentName || "Untitled",
    score: s.score,
    totalMarks: s.totalMarks,
    percentage: s.percentage,
    date: s.submittedAt,
  }));

  res.json(progressData);
});

// @desc    Get progress of all students for assessments uploaded by the logged-in teacher
// @route   GET /api/assessments/teacher/student-progress
// @access  Private (Teacher)
const getStudentProgressForTeacher = asyncHandler(async (req, res) => {
  if (req.user.role !== "teacher") {
    res.status(403);
    throw new Error("Only teachers can access this data");
  }

  // Step 1: Find assessments uploaded by this teacher
  const assessments = await AssessmentUpload.find({ teacherId: req.user._id }).select("_id assessmentName gradeLevel");

  const assessmentMap = {};
  const assessmentIds = assessments.map((a) => {
    assessmentMap[a._id.toString()] = {
      assessmentTitle: a.assessmentName,
      gradeLevel: a.gradeLevel,
    };
    return a._id;
  });

  // Step 2: Get all submissions for those assessments
  const submissions = await AssessmentSubmission.find({
    assessmentId: { $in: assessmentIds },
  })
    .populate("studentId", "name class")
    .sort({ submittedAt: -1 });

  // Step 3: Structure the response
const progressData = await Promise.all(
  submissions.map(async (s) => {
    // 🔑 check if feedback exists for this student + assessment
    const feedback = await Feedback.findOne({
      studentId: s.studentId?._id,
      assessmentId: s.assessmentId,
    });

    return {
      submissionId: s._id,
      studentId: s.studentId?._id,
      studentName: s.studentId?.name || "Unknown",
      studentClass: s.studentId?.class || "N/A",
      assessmentTitle:
        assessmentMap[s.assessmentId.toString()]?.assessmentTitle || "Untitled",
      score: s.score,
      totalMarks: s.totalMarks,
      percentage: s.percentage,
      date: s.submittedAt || s.createdAt,
      timeTaken: s.timeTaken || null,
      feedbackSent: !!feedback, // ✅ NEW FLAG
    };
  })
);

res.json(progressData);
});

// @desc    Get progress summary for logged-in teacher
// @route   GET /api/assessments/teacher-progress
// @access  Private (Teacher)
const getTeacherProgress = asyncHandler(async (req, res) => {
  if (req.user.role !== "teacher") {
    res.status(403);
    throw new Error("Only teachers can access this route");
  }

  const teacherId = req.user._id;

  // Fetch all assessments by this teacher
  const assessments = await AssessmentUpload.find({ teacherId });

  const assessmentIds = assessments.map(a => a._id);
  const totalAssessments = assessments.length;

  // Fetch all submissions to these assessments
  const submissions = await AssessmentSubmission.find({ assessmentId: { $in: assessmentIds } });

  const totalSubmissions = submissions.length;

  const averageScore = submissions.length > 0
    ? (submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length).toFixed(2)
    : 0;

  res.json({
    totalAssessments,
    totalSubmissions,
    averageScore: parseFloat(averageScore),
  });
});

//addeddddddddddddddd

// ✅ Get the 5 most recent approved assessments (for dashboard recent list)
const getRecentAssessments = asyncHandler(async (req, res) => {
  try {
    // Fetch last 5 approved assessments with teacher name and createdAt
    const recent = await AssessmentUpload.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("teacherId", "name email"); // get teacher name

    // Format data for frontend
    const formatted = recent.map((a) => ({
      id: a._id,
      title: a.assessmentName,
      subject: a.subject,
      teacherName: a.teacherId?.name || "Unknown Teacher",
      uploadedAgo: getTimeAgo(a.createdAt),
      createdAt: a.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching recent assessments:", error);
    res.status(500).json({ message: "Failed to load recent assessments" });
  }
});

// Utility function: convert createdAt to "x hours ago"
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  return "Just now";
}

// ✅ Combined recent assessments (Standard + SAT)
const SatAssessment = require("../models/webapp-models/satAssessmentModel");

const getAllRecentAssessments = asyncHandler(async (req, res) => {
  try {
    // Fetch both in parallel
    const [standard, sat] = await Promise.all([
      AssessmentUpload.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("teacherId", "name email"),

      SatAssessment.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("teacherId", "name email"),
    ]);

    const combined = [
      ...standard.map((a) => ({
        id: a._id,
        title: a.assessmentName,
        subject: a.subject,
        type: "Standard",
        teacherName: a.teacherId?.name || "Unknown Teacher",
        uploadedAgo: getTimeAgo(a.createdAt),
        createdAt: a.createdAt,
      })),
      ...sat.map((a) => ({
        id: a._id,
        title: a.satTitle,
        subject: a.sectionType,
        type: "SAT",
        teacherName: a.teacherId?.name || "Unknown Teacher",
        uploadedAgo: getTimeAgo(a.createdAt),
        createdAt: a.createdAt,
      })),
    ];

    // Sort by newest
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Return top 5
    res.json(combined.slice(0, 5));
  } catch (error) {
    console.error("Error fetching all recent assessments:", error);
    res.status(500).json({ message: "Failed to load recent assessments" });
  }
});

const getAssessmentActivity = async (req, res) => {
  try {
    const studentId = req.user._id;

    const submissions = await AssessmentSubmission.find({ studentId });

    // Convert into monthly activity
    const months = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0
    };

    submissions.forEach((sub) => {
      const submittedDate = sub.submittedAt || sub.createdAt;
if (!submittedDate) return;

const month = new Date(submittedDate).toLocaleString("en-US", {
  month: "long",
});

      if (months[month] !== undefined) {
        months[month] += 1;
      }
    });

    const formatted = Object.keys(months).map((m) => ({
      name: m,
      value: months[m],
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Assessment Activity Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ======================= UPCOMING TASKS =========================

// @desc  Get pending tasks for teacher
// @route GET /api/assessments/tasks
// @access Private (Teacher)
const getTeacherUpcomingTasks = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  // 1️⃣ Get assessments by teacher
  const assessments = await AssessmentUpload.find({ teacherId }).select(
    "_id assessmentName subject gradeLevel"
  );

  if (assessments.length === 0) return res.json({ tasks: [] });

  const assessmentMap = {};
  assessments.forEach(a => {
    assessmentMap[a._id.toString()] = {
      name: a.assessmentName,
      subject: a.subject,
      grade: a.gradeLevel
    };
  });

  // 2️⃣ Get pending submissions
  const pending = await AssessmentSubmission.find({
    assessmentId: { $in: assessments.map(a => a._id) },
    isReviewed: { $ne: true }
  })
    .populate("studentId", "name class")
    .sort({ createdAt: -1 });

  const tasks = pending.map((s) => {
    const info = assessmentMap[s.assessmentId.toString()];

    const mistakes = s.responses.filter(r => !r.isCorrect).length;
    const weakTopics = [
      ...new Set(
        s.responses.filter(r => !r.isCorrect).map(r => r.topic || "General")
      )
    ];

    // Priority logic
    let priority = "low";
    if (s.percentage < 40) priority = "high";
    else if (s.percentage < 70) priority = "medium";

    const suspiciousFast =
      s.timeTaken && s.responses.length
        ? s.timeTaken < s.responses.length * 2
        : false;

    return {
      id: s._id,
      assessmentId: s.assessmentId,
      assessmentTitle: info?.name,
      subject: info?.subject,
      grade: info?.grade,

      studentName: s.studentId?.name,
      studentClass: s.studentId?.class || "",

      score: s.score,
      totalMarks: s.totalMarks,
      percentage: s.percentage,
      timeTaken: s.timeTaken,

      mistakes,
      weakTopics,
      priority,
      suspiciousFast,

      submittedAt:
  s.submittedAt
    ? new Date(s.submittedAt).toISOString()
    : s.createdAt
      ? new Date(s.createdAt).toISOString()
      : new Date().toISOString(),

    };
  });

  res.json({ tasks });
});

// @desc Mark a task (submission) as completed
// @route PATCH /api/assessments/tasks/:id/complete
// @access Private (Teacher)
const markTaskCompleted = asyncHandler(async (req, res) => {
  const submissionId = req.params.id;

  await AssessmentSubmission.findByIdAndUpdate(submissionId, {
    isReviewed: true
  });

  res.json({ message: "Task marked as completed" });
});

// ======================= LEADERBOARD =======================
//
// @desc Get student leaderboard (Top 10)
// @route GET /api/assessments/leaderboard
// @access Private (Student)
const getLeaderboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // 1️⃣ Fetch all student submissions (standard + SAT NOT included)
  const submissions = await AssessmentSubmission.aggregate([
    {
      $group: {
        _id: "$studentId",
        totalScore: { $sum: "$score" },
        totalMarks: { $sum: "$totalMarks" },
        percentage: { $avg: "$percentage" },
        attempts: { $sum: 1 }
      }
    }
  ]);

  // 2️⃣ Join with User model to fetch student names
  const leaderboard = await User.aggregate([
    {
      $lookup: {
        from: "assessmentsubmissions",  
        localField: "_id",
        foreignField: "studentId",
        as: "submissionDetails"
      }
    },
    {
      $addFields: {
        totalScore: { $sum: "$submissionDetails.score" },
        totalMarks: { $sum: "$submissionDetails.totalMarks" },
        attempts: { $size: "$submissionDetails" },
        percentage: { $avg: "$submissionDetails.percentage" }
      }
    },
    {
      $match: {
        role: "student",
        totalScore: { $gt: 0 }  // Only students who attempted at least 1 test
      }
    },
    {
      $project: {
        name: 1,
        totalScore: 1,
        percentage: 1,
        attempts: 1
      }
    },
    { $sort: { totalScore: -1 } },
    { $limit: 10 }
  ]);

  // 3️⃣ Find current student's rank
  const rankedAll = await User.aggregate([
    {
      $lookup: {
        from: "assessmentsubmissions",
        localField: "_id",
        foreignField: "studentId",
        as: "submissionDetails"
      }
    },
    {
      $addFields: {
        totalScore: { $sum: "$submissionDetails.score" }
      }
    },
    { $sort: { totalScore: -1 } }
  ]);

  const currentRank =
    rankedAll.findIndex((s) => s._id.toString() === studentId.toString()) + 1;

  res.json({
    leaderboard,
    currentRank
  });
});

module.exports = {
  uploadAssessment,
  approveAssessment,
  getAssessmentForReview,
  updateAssessmentQuestions,
  getTeacherAssessments,
  deleteAssessment,
  getAllAssessments,
  getAssessmentForAttempt,
  submitAssessment,
  getAssessmentSubmissions,
   // Add these three:
  getAssessmentLibraryCount,
  getUploadedAssessmentsCount,
  getNewThisWeekCount,
  getStudentProgress,
  getStudentProgressForTeacher,
  getTeacherProgress, 
  getRecentAssessments,
  getAllRecentAssessments,
  getAssessmentActivity,
  getTeacherUpcomingTasks,
  markTaskCompleted,
  getLeaderboard
};