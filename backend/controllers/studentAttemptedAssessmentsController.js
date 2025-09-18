const AssessmentSubmission = require("../models/webapp-models/assessmentSubmissionModel");
const AssessmentUpload = require("../models/webapp-models/assessmentuploadformModel");
const SatSubmission = require("../models/webapp-models/satSubmissionModel");
const SatAssessment = require("../models/webapp-models/satAssessmentModel");
const User = require("../models/webapp-models/userModel");

// ✅ Get all Standard Assessment attempts (Admin view)
exports.getAllStandardAttemptsForAdmin = async (req, res) => {
  try {
    const submissions = await AssessmentSubmission.find()
      .populate("studentId", "name email class")
      .populate("assessmentId", "assessmentName subject gradeLevel difficulty");

    const rows = submissions.map((s) => ({
      submissionId: s._id,
      studentName: s.studentId?.name || "Unknown",
      studentEmail: s.studentId?.email || "Unknown",
      studentClass: s.studentId?.class || "N/A",
      assessmentTitle: s.assessmentId?.assessmentName || "Untitled",
      subject: s.assessmentId?.subject || "General",
      gradeLevel: s.assessmentId?.gradeLevel || "N/A",
      difficulty: s.assessmentId?.difficulty || "—",
      score: s.score,
      totalMarks: s.totalMarks,
      percentage: s.percentage,
      timeTaken: s.timeTaken,
      submittedAt: s.submittedAt,
    }));

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching standard attempts for admin:", err);
    res.status(500).json({ message: "Failed to fetch standard attempts" });
  }
};

// ✅ Get all SAT Assessment attempts (Admin view)
exports.getAllSatAttemptsForAdmin = async (req, res) => {
  try {
    const submissions = await SatSubmission.find()
      .populate("studentId", "name email class")
      .populate("assessmentId", "satTitle sectionType difficulty");

    const rows = submissions.map((s) => ({
      submissionId: s._id,
      studentName: s.studentId?.name || "Unknown",
      studentEmail: s.studentId?.email || "Unknown",
      studentClass: s.studentId?.class || "N/A",
      assessmentTitle: s.assessmentId?.satTitle || "Untitled",
      sectionType: s.assessmentId?.sectionType || "General",
      difficulty: s.assessmentId?.difficulty || "—",
      score: s.score,
      totalMarks: s.totalMarks,
      percentage: s.percentage,
      timeTaken: s.timeTaken,
      submittedAt: s.submittedAt,
    }));

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching SAT attempts for admin:", err);
    res.status(500).json({ message: "Failed to fetch SAT attempts" });
  }
};
