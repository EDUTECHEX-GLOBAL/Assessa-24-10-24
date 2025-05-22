// assessmentSubmissionModel.js
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: Number, required: true }, // Index of selected option
  isCorrect: { type: Boolean, required: true },
  marksObtained: { type: Number, required: true }
});

const assessmentSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userwebapp",
    required: true,
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssessmentUpload",
    required: true,
  },
  answers: [answerSchema], // Array of question answers
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // Seconds
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AssessmentSubmission", assessmentSubmissionSchema);