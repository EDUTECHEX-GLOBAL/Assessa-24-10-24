const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userwebapp", // or "Teacher" if you're using a separate model
    required: true,
  },
  assessmentName: { type: String, required: true },
  subject: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AssessmentUpload", assessmentSchema);
