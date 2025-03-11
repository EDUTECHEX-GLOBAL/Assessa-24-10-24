// models/activityModel.js
const mongoose = require("mongoose");
const activitySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Userwebapp" },
  dailyActivity: { type: Number, default: 0 },
});
const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;