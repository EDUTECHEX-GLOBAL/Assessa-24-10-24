const Assessment = require("../models/webapp-models/assessmentuploadformModel");
const fs = require("fs");
const path = require("path");

exports.uploadAssessment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { assessmentName, subject, gradeLevel } = req.body;

    const newAssessment = new Assessment({
      title: assessmentName,
      subject,
      gradeLevel,
      fileUrl: `/uploads/assessments/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).substring(1),
      fileSize: req.file.size,
      createdBy: req.user.id,
      type: "teacher"
    });

    const savedAssessment = await newAssessment.save();

    res.status(201).json({
      message: "File uploaded successfully",
      filePath: savedAssessment.fileUrl,
      assessment: savedAssessment
    });

  } catch (error) {
    // Clean up file if error occurs
    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", "assessments", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTeacherAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ 
      createdBy: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json(assessments);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
};