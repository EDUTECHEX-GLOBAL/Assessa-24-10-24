const mongoose = require("mongoose");
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const User = require("../models/webapp-models/userModel");
const Submission = require("../models/webapp-models/assessmentSubmissionModel");
const Feedback = require("../models/webapp-models/FeedbackModel");
const StudyPlan = require("../models/webapp-models/studyplanModel");

// ✅ Bedrock client setup for Claude 3 Haiku
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_MODEL_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_MODEL_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_MODEL_ACCESS_KEY,
  },
});

// ✅ Throttling-safe wrapper
const retryWithBackoff = async (fn, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const shouldRetry =
        err.name === "ThrottlingException" ||
        err.$metadata?.httpStatusCode === 429;

      if (shouldRetry) {
        const baseDelay = 1200 * Math.pow(2, i);
        const jitter = Math.floor(Math.random() * 500);
        const delay = baseDelay + jitter;
        console.warn(`⏳ Claude Throttled (attempt ${i + 1}) — retrying in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Claude retry limit exceeded");
};

const studentChat = async (req, res) => {
  try {
    const { userId, query } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const cleanedQuery = query.trim().toLowerCase();
    const acknowledgments = ["ok", "okay", "thanks", "thank you", "cool", "great", "alright", "got it"];
    if (acknowledgments.includes(cleanedQuery)) {
      return res.status(200).json({
        reply: "You're welcome! Let me know if you need help with anything else. 😊",
      });
    }

    const student = await User.findById(userId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const [submissions, feedbacks, studyPlan] = await Promise.all([
      Submission.find({ studentId: userId }),
      Feedback.find({ studentId: userId }),
      StudyPlan.findOne({ studentId: userId }),
    ]);

    const context = {
      name: student.name,
      attempts: submissions.length,
      feedbacks: feedbacks.length,
      topics: studyPlan?.topics?.join(", ") || "None",
    };

    // ✅ Optional scope control (can remove if undesired)
    const allowedTopics = [
      "study plan",
      "feedback",
      "assessment",
      "quiz",
      "result",
      "score",
      "dashboard",
      "profile",
      "summary",
      "improvement",
      "student panel",
      "problem solving agent",
      "mcq",
      "generate questions",
    ];

    const isValidTopic = allowedTopics.some(topic =>
      query.toLowerCase().includes(topic)
    );

    if (!isValidTopic) {
      return res.status(200).json({
        reply:
          "I'm here to help you navigate the ASSESSA.AI student dashboard. You can ask about your Study Plan, Feedback, Assessments, Progress, or how to generate practice questions!",
      });
    }

    // ✅ Prompt for Claude 3 Haiku
    const prompt = `
You are a helpful AI assistant for the ASSESSA.AI Student Dashboard.

📚 Your job is to guide students through how to use features of the platform — DO NOT generate content like feedback, study plans, summaries, or test results.

--- DASHBOARD FEATURES ---
1. 📊 Assessments — attempt MCQ tests uploaded by teachers.
2. ✅ Progress — track scores, percentage, and test history.
3. 🧠 Study Plan — personalized tasks based on incorrect answers.
4. 💬 Feedback Hub — view feedback given by teachers.
5. 🧩 Problem Solving Agent — ask questions and generate practice MCQs.
6. 👤 Profile — view and update name, email, grade, and bio.

--- RULES FOR YOU ---
- DO NOT fabricate content (feedbacks, questions, summaries)
- Only refer to existing sections of the dashboard
- Use short, helpful, and simple language (2–4 sentences max)

Student Info:
- Name: ${context.name}
- Assessments Taken: ${context.attempts}
- Feedback Count: ${context.feedbacks}
- Topics in Study Plan: ${context.topics}

Student asked: "${query}"

Respond with a helpful guide pointing to the correct section of the dashboard.
`.trim();

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0", // ✅ HAIKU here
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.4,
        top_p: 0.9,
      }),
    });

    const response = await retryWithBackoff(() => bedrock.send(command));
    const raw = await response.body.transformToString();
    const parsed = JSON.parse(raw);
    const reply = parsed.content?.[0]?.text || "⚠ Claude returned no output.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Chatbot error:", err);
    return res.status(500).json({ error: "Bot failed to respond" });
  }
};

module.exports = { studentChat };
