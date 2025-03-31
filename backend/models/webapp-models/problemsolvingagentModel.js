const mongoose = require("mongoose");

const aiAgentSchema = new mongoose.Schema({
  prompt: { type: String, required: true },  // Topic or question
  mode: { type: String, enum: ["ai-generated", "pre-built", "teacher-contributed"], required: true },  // Mode type
  response: { type: String, required: true },  // AI response
  createdAt: { type: Date, default: Date.now }  // Timestamp
});

const ProblemsolvingAgent = mongoose.model("ProblemsolvingAgent", aiAgentSchema);

module.exports = ProblemsolvingAgent;
