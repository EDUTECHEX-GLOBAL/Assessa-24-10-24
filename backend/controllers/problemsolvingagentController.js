const axios = require("axios");
const ProblemsolvingAgent = require("../models/webapp-models/problemsolvingagentModel");
require("dotenv").config();

// Function to classify the prompt and determine the mode
const classifyPrompt = (prompt) => {
  const keywords = {
    "pre-built": ["basic", "fundamental", "standard"],
    "teacher-contributed": ["advanced", "expert", "teacher"],
  };

  for (const [mode, words] of Object.entries(keywords)) {
    if (words.some((word) => prompt.toLowerCase().includes(word))) {
      return mode;
    }
  }

  return "ai-generated";
};

// Function to call FastAPI AI Agent
const aiAgentHandler = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Determine the mode based on the prompt
    const mode = classifyPrompt(prompt);

    // Check MongoDB for existing pre-built or teacher-contributed assessments
    if (mode !== "ai-generated") {
      const existingAssessment = await ProblemsolvingAgent.findOne({ prompt, mode });
      if (existingAssessment) {
        return res.status(200).json({ message: existingAssessment.response });
      }
    }

    // Call FastAPI for AI-generated assessments
    const response = await axios.post("http://127.0.0.1:8000/ai-agent/", { prompt, mode });
    const aiResponse = response.data.response;

    // Store AI-generated assessments in MongoDB
    if (mode === "ai-generated") {
      const newAssessment = new ProblemsolvingAgent({ prompt, mode, response: aiResponse });
      await newAssessment.save();
    }

    res.status(200).json({ message: aiResponse });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to process AI request." });
  }
};

// Fetch all assessments
const getAllAssessments = async (req, res) => {
  try {
    const assessments = await ProblemsolvingAgent.find();
    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch assessments." });
  }
};

module.exports = { aiAgentHandler, getAllAssessments };
