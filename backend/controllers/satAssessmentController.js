const SatAssessment = require("../models/webapp-models/satAssessmentModel");
const { parseSATAssessment, parseSATAssessmentCombined } = require("../utils/satParser");
const { uploadToS3, getSignedUrl, deleteFromS3 } = require("../config/s3Upload");
const SatSubmission = require("../models/webapp-models/satSubmissionModel");
const Feedback = require("../models/webapp-models/FeedbackModel");


// Upload SAT Assessment
exports.uploadSATAssessment = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { satTitle, sectionType } = req.body;

    if (!req.file || !satTitle || !sectionType) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    console.log("📥 Uploading SAT PDF for:", satTitle);

    // ✅ Upload to S3
    const { key } = await uploadToS3(req.file, "sat");
    console.log("📤 S3 Upload Key:", key);

    const difficulties = ["easy", "medium", "hard", "very hard"];
    let anyAssessmentSaved = false;
    const createdAssessments = [];

    for (const difficulty of difficulties) {
      console.log(`🔄 Generating difficulty: ${difficulty}`);
      let questions = [];
      let attempts = 0;

      // Retry loop
      while (questions.length === 0 && attempts < 3) {
        attempts++;
        try {
          if (sectionType === "all") {
            questions = await parseSATAssessmentCombined(req.file.buffer, difficulty);
          } else {
            questions = await parseSATAssessment(req.file.buffer, sectionType, difficulty);
          }
        } catch (err) {
          console.error(`❌ Error generating ${difficulty} (attempt ${attempts}):`, err.message);
        }

        if (!questions || questions.length === 0) {
          console.warn(`⚠️ Attempt ${attempts} failed for difficulty: ${difficulty}`);
        }
      }

      if (!questions || questions.length === 0) {
        console.error(`❌ Skipping ${difficulty} — no valid questions generated after retries`);
        continue;
      }

      const assessment = new SatAssessment({
        teacherId,
        satTitle,
        sectionType,
        difficulty,
        questions,
        fileUrl: key,
      });

      await assessment.save();
      createdAssessments.push({
        id: assessment._id,
        difficulty,
        questionCount: questions.length,
      });

      console.log(`✅ Saved ${difficulty} with ${questions.length} questions`);
      anyAssessmentSaved = true;
    }

    if (!anyAssessmentSaved) {
      return res.status(422).json({
        message: "Failed to generate questions for any difficulty level.",
      });
    }

    res.status(201).json({
      message: "SAT assessment uploaded and difficulty variants generated successfully.",
      assessments: createdAssessments,
    });

  } catch (err) {
    console.error("❌ SAT upload error:", err);
    res.status(500).json({ message: "Internal server error during SAT upload." });
  }
};


// Get all SAT assessments by logged-in teacher
exports.getMySATAssessments = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const assessments = await SatAssessment.find({ teacherId }).sort({ createdAt: -1 });

    const assessmentsWithUrls = await Promise.all(
      assessments.map(async (a) => ({
        ...a._doc,
        signedUrl: a.fileUrl ? await getSignedUrl(a.fileUrl) : null,
      }))
    );

    res.json(assessmentsWithUrls);
  } catch (error) {
    console.error("❌ Error fetching SAT assessments:", error);
    res.status(500).json({ message: "Failed to fetch SAT assessments" });
  }
};

// ✅ Delete SAT Assessment
exports.deleteSATAssessment = async (req, res) => {
  try {
    const assessment = await SatAssessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: "SAT assessment not found" });
    }

    if (assessment.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this SAT assessment" });
    }

    // Delete from S3 if exists
    if (assessment.fileUrl) {
      try {
        await deleteFromS3(assessment.fileUrl);
      } catch (err) {
        console.warn("⚠️ Failed to delete file from S3:", err.message);
      }
    }

    await assessment.deleteOne();

    res.json({ message: "SAT assessment deleted successfully", id: req.params.id });
  } catch (err) {
    console.error("❌ Error deleting SAT assessment:", err);
    res.status(500).json({ message: "Failed to delete SAT assessment" });
  }
};
// ✅ Get SAT Assessment Count for Dashboard
exports.getSatAssessmentCount = async (req, res) => {
  try {
    const count = await SatAssessment.countDocuments({ teacherId: req.user._id });
    res.json({ count });
  } catch (error) {
    console.error("❌ Error fetching SAT assessment count:", error);
    res.status(500).json({ message: "Failed to fetch SAT assessment count" });
  }
};

// ✅ Get all SAT assessments (for students)
exports.getAllSATAssessmentsForStudents = async (req, res) => {
  try {
    // ✅ Step 1: Check if the user is a student
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can access this route." });
    }

    // ✅ Step 2: Fetch assessments and student submissions
    const assessments = await SatAssessment.find().sort({ createdAt: -1 });
    const studentId = req.user._id;
    const submissions = await SatSubmission.find({ studentId });

    // ✅ Step 3: Combine assessments with submission and signed S3 URL
    const assessmentsWithSubmission = await Promise.all(
      assessments.map(async (a) => {
        const submission = submissions.find(
          (s) => s.assessmentId.toString() === a._id.toString()
        );
        return {
          ...a._doc,
          submission: submission
            ? {
                score: submission.score,
                totalMarks: submission.totalMarks,
                percentage: submission.percentage,
              }
            : null,
          signedUrl: a.fileUrl ? await getSignedUrl(a.fileUrl) : null,
        };
      })
    );

    // ✅ Step 4: Only one response should be sent
    res.json(assessmentsWithSubmission);
  } catch (err) {
    console.error("❌ Error fetching SAT assessments for students:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to fetch SAT assessments" });
    }
  }
};


// ✅ Get one SAT assessment for attempt (no restrictions on correct answer)
exports.getSatAssessmentForAttempt = async (req, res) => {
  try {
    const satAssessment = await SatAssessment.findById(req.params.id);

    if (!satAssessment) {
      return res.status(404).json({ message: "SAT assessment not found" });
    }

    res.status(200).json({
      _id: satAssessment._id,
      satTitle: satAssessment.satTitle,
      sectionType: satAssessment.sectionType,
      timeLimit: 30, // or customize per sectionType
      questions: satAssessment.questions.map(q => ({
        questionText: q.questionText,
        passage: q.passage || null,
        options: q.options || [],
        type: q.type,
        marks: q.marks || 1,
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching SAT assessment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all submissions for a SAT assessment (Teacher view)
exports.getSatAssessmentSubmissions = async (req, res) => {
  try {
    const satAssessment = await SatAssessment.findById(req.params.id);
    if (!satAssessment) {
      return res.status(404).json({ message: "SAT assessment not found" });
    }

    // Only the teacher who created the SAT assessment can view
    if (satAssessment.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view submissions" });
    }

    const submissions = await SatAssessmentSubmission.find({
      assessmentId: req.params.id,
    }).populate("studentId", "name email");

    res.status(200).json({
      assessment: {
        _id: satAssessment._id,
        satTitle: satAssessment.satTitle,
        sectionType: satAssessment.sectionType,
        totalQuestions: satAssessment.questions.length,
        totalMarks: satAssessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      },
      submissions,
    });
  } catch (err) {
    console.error("❌ Error fetching SAT submissions:", err);
    res.status(500).json({ message: "Internal server error while fetching submissions" });
  }
};

// @desc    Submit answers to a SAT assessment
// @route   POST /api/sat-assessments/:id/submit
// @access  Private (Student)
// @desc    Submit answers to a SAT assessment
// @route   POST /api/sat-assessments/:id/submit
// @access  Private (Student)
exports.submitSatAssessment = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const studentId = req.user._id;

    // Validate input
    if (!Array.isArray(answers) || typeof timeTaken !== 'number' || timeTaken < 0) {
      return res.status(400).json({ 
        message: "Invalid request format" 
      });
    }

    const assessment = await SatAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: "SAT assessment not found" });
    }

    // Validate assessment structure before processing
    const invalidQuestions = assessment.questions.filter((q, i) => {
      if (q.type === 'mcq') {
        return (
          typeof q.correctAnswer !== 'number' ||
          q.correctAnswer < 0 ||
          q.correctAnswer >= (q.options?.length || 0)
        );
      }
      return false;
    });

    if (invalidQuestions.length > 0) {
      console.error('Invalid questions found:', invalidQuestions.map(q => ({
        type: q.type,
        correctAnswer: q.correctAnswer,
        optionsLength: q.options?.length
      })));
      return res.status(422).json({
        message: "Assessment contains invalid questions",
        invalidCount: invalidQuestions.length
      });
    }

    if (answers.length !== assessment.questions.length) {
      return res.status(400).json({ 
        message: `Expected ${assessment.questions.length} answers, received ${answers.length}` 
      });
    }

    let score = 0;
    const responses = [];
    const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    // Enhanced answer processing
    assessment.questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      const questionMarks = question.marks || 1;
      let isCorrect = false;

      if (question.type === 'mcq') {
        // Robust MCQ comparison
        const studentAns = parseInt(studentAnswer);
        if (!isNaN(studentAns) && studentAns >= 0 && studentAns < question.options.length) {
          isCorrect = studentAns === parseInt(question.correctAnswer);
        }
      } else {
        // Advanced Grid-in comparison
        const normalize = (ans) => {
          if (ans === null || ans === undefined) return '';
          return String(ans)
            .trim()
            .toLowerCase()
            .replace(/[^0-9\.\/\-]/g, '')  // Remove non-numeric chars
            .replace(/^0+(\d)/, '$1')     // Remove leading zeros
            .replace(/(\.\d*?)0+$/, '$1') // Remove trailing decimal zeros
            .replace(/\.$/, '');          // Remove trailing decimal point
        };

        isCorrect = normalize(studentAnswer) === normalize(question.correctAnswer);
      }

      if (isCorrect) score += questionMarks;

      responses.push({
        questionText: question.questionText,
        options: question.options || [],
        correctAnswer: question.correctAnswer,
        studentAnswer,
        isCorrect,
        marks: questionMarks,
        type: question.type
      });
    });

    const percentage = (score / totalMarks) * 100;

    const submission = new SatSubmission({
      studentId,
      assessmentId: assessment._id,
      responses,
      score,
      totalMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      timeTaken
    });

    await submission.save();

    res.status(200).json({ 
      success: true,
      score,
      totalMarks,
      percentage: parseFloat(percentage.toFixed(2))
    });

  } catch (err) {
    console.error("SAT submission error:", err);
    res.status(500).json({ 
      message: "Failed to submit SAT assessment",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// ✅ Get all SAT submissions for current student
exports.getMySatSubmissions = async (req, res) => {
  try {
    const studentId = req.user._id;
    const submissions = await SatSubmission.find({ studentId }).select("assessmentId");
    const completedAssessmentIds = submissions.map(s => s.assessmentId.toString());
    res.json({ completed: completedAssessmentIds });
  } catch (err) {
    console.error("❌ Failed to fetch student's SAT submissions:", err);
    res.status(500).json({ message: "Failed to fetch SAT submissions" });
  }
};
// @desc    Get all SAT assessments uploaded by the current teacher
// @route   GET /api/sat-assessments/teacher/all?status=pending|approved|all
// @access  Private (Teacher only)
exports.getMySATAssessmentsForReview = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { status } = req.query;

    let filter = { teacherId };

    if (status === "pending") {
      filter.isApproved = false;
    } else if (status === "approved") {
      filter.isApproved = true;
    }

    const assessments = await SatAssessment.find(filter);
    res.json(assessments);
  } catch (err) {
    console.error("Error fetching SAT assessments for review", err);
    res.status(500).json({ message: "Failed to fetch SAT assessments" });
  }
};
// @desc    Approve a specific SAT assessment
// @route   PATCH /api/sat-assessments/:id/approve
// @access  Private (Teacher only)
exports.approveSATAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await SatAssessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "SAT Assessment not found" });
    }

    assessment.isApproved = true;
    await assessment.save();

    res.json({ message: "SAT Assessment approved successfully" });
  } catch (err) {
    console.error("Error approving SAT assessment", err);
    res.status(500).json({ message: "Error approving SAT assessment" });
  }
};
// @desc    Get SAT student progress for teacher dashboard
// @route   GET /api/sat-assessments/teacher/student-progress
// @access  Private (Teacher only)
exports.getSatStudentProgress = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // All submissions for this teacher’s SAT assessments
    const submissions = await SatSubmission.find()
      .populate({
        path: "assessmentId",
        match: { teacherId },
        select: "satTitle sectionType teacherId",
      })
      .populate({
        path: "studentId",
        select: "name class",
      });

    // Keep only this teacher’s
    const filtered = submissions.filter((s) => s.assessmentId);

    // 🔎 Build sets to query feedbacks (Feedback schema has studentId + assessmentId)
    const studentIds = filtered.map((s) => s.studentId?._id).filter(Boolean);
    const assessmentIds = filtered.map((s) => s.assessmentId?._id).filter(Boolean);

    // Fetch all existing feedbacks that match any of these pairs
    const existingFeedbacks = await Feedback.find({
      studentId: { $in: studentIds },
      assessmentId: { $in: assessmentIds },
    }).select("studentId assessmentId");

    // Fast lookup: studentId-assessmentId -> true
    const sentSet = new Set(
      existingFeedbacks.map(
        (f) => `${f.studentId.toString()}-${f.assessmentId.toString()}`
      )
    );

    const formatted = filtered.map((s) => {
      const perc =
        s.percentage ??
        (s.totalMarks ? Number(((s.score / s.totalMarks) * 100).toFixed(2)) : 0);

      const sentKey = `${s.studentId?._id?.toString() || ""}-${s.assessmentId?._id?.toString() || ""}`;
      const feedbackSent = sentSet.has(sentKey);

      return {
        studentName: s.studentId?.name || "Unknown",
        className: s.studentId?.class || "Unknown",
        assessmentTitle: s.assessmentId?.satTitle || "Untitled",
        sectionType: s.assessmentId?.sectionType || "General",
        score: s.score ?? 0,
        totalMarks: s.totalMarks ?? 0,
        percentage: perc,
        submittedDate: s.submittedAt || s.createdAt || null,
        timeTaken: s.timeTaken,
        feedbackSent,                              // ✅ reliable
        submissionId: s._id,
        studentId: s.studentId?._id,
        assessmentId: s.assessmentId?._id,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching SAT student progress:", err);
    res.status(500).json({ message: "Failed to fetch SAT student progress" });
  }
};
