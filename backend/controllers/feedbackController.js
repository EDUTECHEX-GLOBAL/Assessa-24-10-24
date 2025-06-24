// controllers/feedbackController.js
// ---------------------------------
// Requires Node ≥18, Express, and @aws-sdk/client-bedrock-runtime 3.x

const asyncHandler = require("express-async-handler");
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const AssessmentSubmission = require("../models/webapp-models/assessmentSubmissionModel");
const AssessmentUpload = require("../models/webapp-models/assessmentuploadformModel");
const Feedback = require("../models/webapp-models/FeedbackModel");

// ─── 1. Bedrock client ────────────────────────────────────────────────────────
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_MODEL_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_MODEL_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_MODEL_ACCESS_KEY,
  },
});

// ─── 2. Claude prompt builder ─────────────────────────────────────────────────
function buildPrompt({ student, assessment, submission, questions, history }) {
  return `
You are an experienced high-school teacher.

Task: Analyse the student’s latest test and return constructive, actionable feedback in JSON.

----------------
STUDENT METRICS
----------------
Name: ${student.name}
Grade: ${student.class}
Subject: ${assessment.assessmentName}
Score: ${submission.score} / ${submission.totalMarks}
Percentage: ${submission.percentage} %
Duration: ${submission.timeTaken || "unknown"}

---------------
QUESTION SET
---------------
Below are the student's answers and question data.

For each question, please:
- Assign a meaningful topic (e.g., "Periodic Table", "Algebra", "Photosynthesis", etc.)
- Use this topic classification to identify topic strengths and weaknesses

${JSON.stringify(questions, null, 2)}

--------------------
PAST PERFORMANCE
--------------------
${JSON.stringify(history, null, 2)}

-----------------
OUTPUT FORMAT
-----------------
Return **exactly** this JSON schema, nothing else:

{
  "overallSummary": "string",
  "topicStrengths": ["string", ...],
  "topicWeaknesses": ["string", ...],
  "nextSteps": [
    { "action": "string", "resource": "string" }
  ]
}
`;
}

// ─── 3. Controller: generate feedback ─────────────────────────────────────────
exports.generateFeedback = asyncHandler(async (req, res) => {
  const { studentId, submissionId } = req.body;

  const submission = await AssessmentSubmission
    .findById(submissionId)
    .populate("studentId", "name class");

  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  if (submission.studentId._id.toString() !== studentId) {
    res.status(400);
    throw new Error("Student / submission mismatch");
  }

  const assessment = await AssessmentUpload.findById(submission.assessmentId);
  if (!assessment) {
    res.status(404);
    throw new Error("Assessment not found");
  }

  const questions = submission.responses ?? [];

  const historyDocs = await AssessmentSubmission.find({
    studentId,
    subject: assessment.assessmentName,
    _id: { $ne: submission._id },
  })
    .sort({ submittedAt: -1 })
    .limit(5)
    .select("percentage submittedAt");

  const history = historyDocs.map((d) => ({
    date: d.submittedAt.toISOString().split("T")[0],
    percent: d.percentage,
  }));

  const prompt = buildPrompt({
    student: submission.studentId,
    assessment,
    submission,
    questions,
    history,
  });

  // ─── ✅ CORRECT Claude 3.5-compatible body ────────────────────────────────
  const bedrockRes = await bedrock.send(
    new InvokeModelCommand({
      modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.4,
        top_p: 0.9,
      }),
    })
  );

  // --- Double-parse logic for Claude's response ---
  const raw = new TextDecoder().decode(bedrockRes.body);
  console.log("🧠 Claude Raw Response:", raw); // ✅ Helpful debug

  let feedbackJSON;
  try {
    const parsedClaude = JSON.parse(raw);
    const textBlock = parsedClaude.content?.[0]?.text ?? "{}";
    feedbackJSON = JSON.parse(textBlock);
  } catch (e) {
    console.error("⚠️ Model returned non-JSON:", raw);
    throw new Error("Model response unparsable");
  }

  // Save feedbackText as string in DB
  const fbDoc = await Feedback.create({
    studentId,
    assessmentId: assessment._id,
    topic: assessment.assessmentName,
    score: submission.score,
    total: submission.totalMarks,
    percentage: submission.percentage,
    feedbackText: JSON.stringify(feedbackJSON), // Store as string
  });

  // Return the feedback with feedbackText as parsed object
  const responseDoc = {
    ...fbDoc.toObject(),
    feedbackText: feedbackJSON,
  };

  res.status(201).json(responseDoc);
});

// ─── 4. Controller: list all feedback ────────────────────────────────────────
exports.getAllFeedbacks = asyncHandler(async (_req, res) => {
  const feedbacks = await Feedback.find().populate("studentId assessmentId");
  const parsedFeedbacks = feedbacks.map(fb => {
    let feedbackObj;
    try {
      feedbackObj = JSON.parse(fb.feedbackText);
    } catch (e) {
      feedbackObj = null;
    }
    return {
      ...fb.toObject(),
      feedbackText: feedbackObj,
    };
  });
  res.json(parsedFeedbacks);
});
