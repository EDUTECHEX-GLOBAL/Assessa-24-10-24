const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/dbConfig");
const axios = require("axios");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

// Routes
const userRoutes = require("./routes/webapp-routes/userRoutes");
const internRoutes = require("./routes/webapp-routes/internshipPostRoutes");
const skillnaavRoute = require("./routes/skillnaavRoute");
const applicationRoutes = require("./routes/webapp-routes/applicationRoutes");

app.use("/api/users", userRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/skillnaav", skillnaavRoute);
app.use("/api/contact", skillnaavRoute);

// Assessment Generation Route
app.post("/api/generate-assessment", async (req, res) => {
  const { topic, difficulty, duration } = req.body;

  if (!topic || !difficulty || !duration) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const maxTokens = 2048;
  const prompt = `Create a ${difficulty} level assessment on the topic "${topic}" for ${duration} minutes.
Provide 5 multiple-choice questions with 4 options each (labeled a, b, c, d). Include the correct answer for each question as follows:
Question 1: [question text]
a. [option 1]
b. [option 2]
c. [option 3]
d. [option 4]
Correct Answer: [correct option letter]

Format the output exactly as specified, with each question followed by the correct answer.`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
        n: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const generatedAssessment = response.data.choices[0].message.content;
    res.json({ success: true, assessment: generatedAssessment });
  } catch (error) {
    console.error("Error generating assessment:", error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, error: "Failed to generate assessment." });
  }
});


// Assessment Review Route
app.post("/api/review-assessment", async (req, res) => {
  const { answers, correctAnswers } = req.body;

  if (!answers || !correctAnswers) {
    return res.status(400).json({ error: "Answers and correct answers are required!" });
  }

  let score = 0;
  for (const key in correctAnswers) {
    if (answers[key] === correctAnswers[key]) {
      score += 1;
    }
  }

  const totalQuestions = Object.keys(correctAnswers).length;
  res.json({
    success: true,
    score,
    totalQuestions,
    message: `You scored ${score} out of ${totalQuestions}.`,
  });
});

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
