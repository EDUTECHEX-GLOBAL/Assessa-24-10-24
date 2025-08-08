const mongoose = require("mongoose");

const satQuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'grid_in'],
    required: true,
  },
  questionText: { type: String, required: true },
  passage: { type: String },
  options: [{ type: String }],
  correctAnswer: { 
    type: mongoose.Schema.Types.Mixed, // Can be String or Number
    required: true,
    validate: {
      validator: function(value) {
        if (this.type === 'mcq') {
          return Number.isInteger(value) && value >= 0 && value < this.options.length;
        }
        return true; // No validation for grid_in type
      },
      message: 'MCQ correctAnswer must be a valid option index'
    }
  },
  marks: { type: Number, default: 1 },
  questionNumber: { type: Number }
}, { _id: true });

const satAssessmentSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userwebapp",
    required: true,
  },
  satTitle: { type: String, required: true },
  sectionType: {
    type: String,
    enum: ['reading', 'writing', 'math_no_calc', 'math_calc', 'all'],
    required: true,
  },
  difficulty: {
  type: String,
  enum: ['easy', 'medium', 'hard', 'very hard'],
  required: true
},

  questions: [satQuestionSchema],
  fileUrl: { type: String },
  isApproved: { type: Boolean, default: false }, // ✅ NEW FIELD
  createdAt: { type: Date, default: Date.now },
});

// Add validation for existing assessments
satAssessmentSchema.pre('save', function(next) {
  this.questions.forEach((question, index) => {
    if (question.type === 'mcq') {
      if (typeof question.correctAnswer !== 'number' || 
          question.correctAnswer < 0 || 
          question.correctAnswer >= question.options.length) {
        throw new Error(
          `Question ${index + 1} has invalid correctAnswer index (${question.correctAnswer})`
        );
      }
    }
  });
  next();
});

module.exports = mongoose.model("SatAssessment", satAssessmentSchema);