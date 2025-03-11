// controllers/activityController.js
const Activity = require("../models/webapp-models/activityModel");
const asyncHandler = require("express-async-handler");

const getDailyActivity = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const activity = await Activity.findOne({ student: studentId });
  res.json({ dailyActivity: activity ? activity.dailyActivity : 0 });
});

module.exports = { getDailyActivity };
