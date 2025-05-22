// assessmentuploadformModel.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of options
  correctAnswer: { type: Number, required: true }, // Index of correct option
  marks: { type: Number, default: 1 }
});

const assessmentSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Userwebapp",
    required: true 
  },
  assessmentName: { type: String, required: true },
  subject: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  fileUrl: { type: String },
  questions: [questionSchema], // Array of questions
  timeLimit: { type: Number, default: 30 }, // Minutes
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AssessmentUpload", assessmentSchema);