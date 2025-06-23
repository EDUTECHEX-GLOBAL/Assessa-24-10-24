const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  topic: { type: String },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  percentage: { type: Number },
  feedbackText: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
