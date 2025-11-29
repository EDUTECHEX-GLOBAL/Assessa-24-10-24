const mongoose = require("mongoose");

const dailyQuizSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["standard", "sat"],
    required: true
  },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: Number
    }
  ],
  submitted: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("DailyQuiz", dailyQuizSchema);
