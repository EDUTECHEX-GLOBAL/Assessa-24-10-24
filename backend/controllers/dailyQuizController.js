// =============================================
// DAILY QUIZ CONTROLLER (FINAL + STABLE)
// Using Bedrock Claude 3.5 Sonnet
// Auto-generate quizzes per-student on demand
// =============================================

const DailyQuiz = require("../models/webapp-models/dailyQuizModel");
const Userwebapp = require("../models/webapp-models/userModel");

const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");


// --------------------------------------------
// Bedrock Config
// --------------------------------------------
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_MODEL_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_MODEL_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_MODEL_ACCESS_KEY,
  },
});


// --------------------------------------------
// Helper: Today's Date (YYYY-MM-DD)
// --------------------------------------------
function todayDate() {
  return new Date().toISOString().split("T")[0];
}


// --------------------------------------------
// Utility: SAFE JSON Extractor
// Handles Markdown, ```json blocks, noise
// --------------------------------------------
function extractJSON(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("JSON not found in model output");

  return JSON.parse(match[0]);
}


// --------------------------------------------
// Bedrock Caller
// Returns extracted JSON block
// --------------------------------------------
async function callBedrock(prompt) {
  const cmd = new InvokeModelCommand({
    modelId:
      process.env.BEDROCK_MODEL_ID ||
      "anthropic.claude-3-5-sonnet-20240620-v1:0",

    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.4,
    }),
  });

  const res = await bedrock.send(cmd);
  const raw = new TextDecoder().decode(res.body);

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Bedrock returned malformed JSON: " + raw.slice(0, 120));
  }

  const text = parsed?.content?.[0]?.text;

  if (!text) throw new Error("Model returned empty content");

  return extractJSON(text);
}


// --------------------------------------------
//  STANDARD PROMPT
// --------------------------------------------
function buildStandardPrompt(classLevel) {
  return `
Generate exactly 10 MCQ questions for a Class ${classLevel} student.
Subjects: Mathematics + Science.
Difficulty: Medium.

Return ONLY JSON:

{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ]
}

Rules:
- EXACTLY 10 questions
- correctAnswer = index (0–3)
- No explanation
- No markdown
  `;
}


// --------------------------------------------
//  SAT PROMPT
// --------------------------------------------
function buildSATPrompt(classLevel) {
  return `
Generate exactly 10 SAT-style MCQ questions for a Class ${classLevel} student.
Mix: Reading + Writing + Math.
Difficulty: Medium.

Return ONLY JSON:

{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1
    }
  ]
}

Rules:
- EXACTLY 10 questions
- correctAnswer = index (0–3)
- No explanation
- No markdown
  `;
}


// --------------------------------------------
// 1️⃣ GET TODAY QUIZ (AUTO GENERATE)
// --------------------------------------------
exports.getTodayQuiz = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
    }

    const studentId = req.user._id;
    const type = req.query.type;
    const date = todayDate();

    // Check if quiz already exists
    let quiz = await DailyQuiz.findOne({ studentId, type, date });
    if (quiz) return res.json(quiz);

    // Generate quiz
    const classLevel = Number(req.user.class) || 10;
    const prompt =
      type === "standard"
        ? buildStandardPrompt(classLevel)
        : buildSATPrompt(classLevel);

    const json = await callBedrock(prompt);

    const questions = json.questions?.slice(0, 10) || [];

    if (questions.length !== 10) {
      throw new Error("Model returned less than 10 questions");
    }

    // Save quiz
    quiz = await DailyQuiz.create({
      studentId,
      type,
      date,
      questions,
    });

    return res.json(quiz);

  } catch (err) {
    console.error("❌ getTodayQuiz ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};


// --------------------------------------------
// 2️⃣ SUBMIT QUIZ
// --------------------------------------------
exports.submitTodayQuiz = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const { answers } = req.body;
    const type = req.query.type;
    const date = todayDate();

    const quiz = await DailyQuiz.findOne({
      studentId: req.user._id,
      date,
      type,
    });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.submitted)
      return res.status(400).json({ message: "Already submitted" });

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (String(answers[i]) === String(q.correctAnswer)) score++;
    });

    quiz.score = score;
    quiz.submitted = true;
    await quiz.save();

    res.json({ score, outOf: quiz.questions.length });

  } catch (err) {
    console.error("❌ submitTodayQuiz ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};


// --------------------------------------------
// 3️⃣ GET TODAY SCORE
// --------------------------------------------
exports.getDailyQuizScore = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const type = req.query.type;
    const date = todayDate();

    const quiz = await DailyQuiz.findOne({
      studentId: req.user._id,
      type,
      date,
      submitted: true,
    });

    if (!quiz) return res.status(404).json({ message: "Score not found" });

    res.json({ score: quiz.score });

  } catch (err) {
    console.error("❌ getDailyQuizScore ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};
