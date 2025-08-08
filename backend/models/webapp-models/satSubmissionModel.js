const mongoose = require("mongoose");

const satResponseSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String] }, // Optional for grid-in questions
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be Number or String
  studentAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be Number or String
  isCorrect: { type: Boolean, required: true },
  marks: { type: Number, required: true },
  type: { type: String, enum: ['mcq', 'grid_in'], required: true },
}, { _id: false });

const satSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userwebapp",
    required: true,
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SatAssessment",
    required: true,
  },
  responses: [satResponseSchema],
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SatSubmission", satSubmissionSchema);