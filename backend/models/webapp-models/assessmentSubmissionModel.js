const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  studentAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  marks: { type: Number, required: true },
  topic: { type: String }, // optional, useful for feedback AI
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
  responses: [responseSchema], // ✅ Replaces 'answers'
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // Seconds
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AssessmentSubmission", assessmentSubmissionSchema);
