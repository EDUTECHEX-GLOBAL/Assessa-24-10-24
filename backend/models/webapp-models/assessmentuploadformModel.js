const mongoose = require("mongoose");

const AssessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ["pdf", "doc", "docx"] },
  fileSize: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, enum: ["prebuilt", "teacher", "ai-generated"], default: "teacher" }
}, { timestamps: true });

module.exports = mongoose.model("Assessment", AssessmentSchema);