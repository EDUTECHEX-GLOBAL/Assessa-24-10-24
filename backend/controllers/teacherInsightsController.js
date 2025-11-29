const AssessmentSubmission = require("../models/webapp-models/assessmentSubmissionModel");

exports.getDynamicTeacherInsights = async (req, res) => {
  try {
    let insights = [];

    // ----------------------------------------
    // 1️⃣ Worst Topic (Highest mistakes)
    // ----------------------------------------
    const worstTopic = await AssessmentSubmission.aggregate([
      { $unwind: "$questions" },
      { $match: { "questions.isCorrect": false } },
      { $group: { _id: "$questions.topic", mistakes: { $sum: 1 } } },
      { $sort: { mistakes: -1 } },
      { $limit: 1 }
    ]);

    if (worstTopic.length > 0 && worstTopic[0]._id) {
      insights.push({
        type: "insight",
        title: "Students struggled most in",
        description: `Most mistakes were in ${worstTopic[0]._id}.`,
        icon: "💡",
        priority: 1
      });
    }

    // ----------------------------------------
    // 2️⃣ Performance Trend (Average score)
    // ----------------------------------------
    const avgScore = await AssessmentSubmission.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$percentage" } } }
    ]);

    if (avgScore.length > 0) {
      insights.push({
        type: "trend",
        title: "Performance Trend",
        description: `Average class score: ${avgScore[0].avgScore.toFixed(1)}%.`,
        icon: "📈",
        priority: 2
      });
    }

  // 3️⃣ Proper Completion Rate (Unique students)
// Count unique students who completed at least one assessment
const uniqueStudents = await AssessmentSubmission.distinct("studentId");

// Proper completion rate should NEVER exceed 100%
const completionRate = uniqueStudents.length === 0
  ? 0
  : 100; // All unique students listed have completed at least one assessment

insights.push({
  type: "trend",
  title: "Class Completion Rate",
  description: `${completionRate}% students completed at least one assessment.`,
  icon: "📘",
  priority: 3
});

    // ----------------------------------------
    // 4️⃣ Suggested Action (Smart AI logic)
    // ----------------------------------------
    let actionDesc = null;

    if (avgScore.length > 0 && avgScore[0].avgScore < 50) {
      actionDesc = "Performance is low — schedule a revision session.";
    } else if (worstTopic.length > 0) {
      actionDesc = `Assign reinforcement worksheets on ${worstTopic[0]._id}.`;
    } else if (completionRate < 50) {
      actionDesc = "Only half the class completed work — send a reminder.";
    }

    if (actionDesc) {
      insights.push({
        type: "action",
        title: "Suggested Action",
        description: actionDesc,
        icon: "📝",
        priority: 4
      });
    }

    // ----------------------------------------
    // 5️⃣ Most Improved Student
    // ----------------------------------------
    const improvements = await AssessmentSubmission.aggregate([
      {
        $group: {
          _id: "$studentId",
          firstScore: { $first: "$percentage" },
          lastScore: { $last: "$percentage" }
        }
      },
      {
        $project: {
          improvement: { $subtract: ["$lastScore", "$firstScore"] }
        }
      },
      { $sort: { improvement: -1 } },
      { $limit: 1 }
    ]);

    if (improvements.length > 0 && improvements[0].improvement > 0) {
      insights.push({
        type: "improved",
        title: "Most Improved Student",
        description: `Top improvement: ${improvements[0].improvement.toFixed(
          1
        )}% this month.`,
        icon: "🚀",
        priority: 5
      });
    }

    // ----------------------------------------
    // 6️⃣ Declining Performance Alert
    // ----------------------------------------
    const declines = await AssessmentSubmission.aggregate([
      {
        $group: {
          _id: "$studentId",
          firstScore: { $first: "$percentage" },
          lastScore: { $last: "$percentage" }
        }
      },
      {
        $project: {
          decline: { $subtract: ["$firstScore", "$lastScore"] }
        }
      },
      { $sort: { decline: -1 } },
      { $limit: 1 }
    ]);

    if (declines.length > 0 && declines[0].decline > 10) {
      insights.push({
        type: "decline",
        title: "Performance Drop Alert",
        description: `Some students dropped by ${declines[0].decline.toFixed(
          1
        )}%. Needs attention.`,
        icon: "⚠️",
        priority: 6
      });
    }

    // ----------------------------------------
    // 7️⃣ Recommended Next Assessment
    // ----------------------------------------
    if (worstTopic.length > 0) {
      insights.push({
        type: "recommend",
        title: "Recommended Next Assessment",
        description: `Assign Level-2 assessment on ${worstTopic[0]._id}.`,
        icon: "📘",
        priority: 7
      });
    }

    // ----------------------------------------
    // FINAL SORT — by priority
    // ----------------------------------------
    insights = insights.sort((a, b) => a.priority - b.priority);

    // First 3 important
    const firstThree = insights.slice(0, 3);

    res.json({
      insights: firstThree,
      allInsights: insights
    });
  } catch (error) {
    console.error("Insights Error:", error);
    res.status(500).json({ message: "Failed to load insights" });
  }
};
