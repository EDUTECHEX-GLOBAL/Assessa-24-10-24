const Feedback = require("../models/webapp-models/FeedbackModel");

exports.generateFeedback = async (req, res) => {
  try {
    const { studentId, assessmentId, score, total, feedbackMessage, topic } = req.body;

    const percentage = ((score / total) * 100).toFixed(1);

    const newFeedback = new Feedback({
      topic,
      score,
      total,
      percentage,
      studentId,
      assessmentId,
      feedbackText: feedbackMessage,
    });

    await newFeedback.save();
    res.status(201).json({ message: "Feedback saved successfully" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
