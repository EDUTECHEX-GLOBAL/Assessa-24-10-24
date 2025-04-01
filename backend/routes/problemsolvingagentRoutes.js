const express = require("express");
const router = express.Router();
const { aiAgentHandler, getAllAssessments } = require("../controllers/problemsolvingagentController");

// Route to generate assessments
router.post("/ask-ai", aiAgentHandler);

// Route to fetch all stored assessments
router.get("/assessments", getAllAssessments);

module.exports = router;
