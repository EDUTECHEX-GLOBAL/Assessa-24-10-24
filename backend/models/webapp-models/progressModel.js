// models/progressModel.js
const mongoose = require("mongoose");
const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Userwebapp" },
  month: { type: String, required: true },
  activityLevel: { type: Number, default: 0 },
});
const Progress = mongoose.model("Progress", progressSchema);
module.exports = Progress;