const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Teacher = require("../models/webapp-models/teacherModel");
const generateToken = require("../utils/generateToken");
const registerTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }
  const teacherExists = await Teacher.findOne({ email });
  if (teacherExists) {
    return res.status(400).json({ message: "Teacher already exists." });
  }
  const teacher = await Teacher.create({ name, email, password, pic });
  if (teacher) {
    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      pic: teacher.pic,
      token: generateToken(teacher._id),
    });
  } else {
    res.status(400).json({ message: "Error Occurred" });
  }
});

const authTeacher = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const teacher = await Teacher.findOne({ email });
  if (teacher && (await teacher.matchPassword(password))) {
    res.json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      pic: teacher.pic,
      token: generateToken(teacher._id),
    });
  } else {
    res.status(400).json({ message: "Invalid Email or Password!" });
  }
});

const updateTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.user._id);
  if (teacher) {
    teacher.name = req.body.name || teacher.name;
    teacher.email = req.body.email || teacher.email;
    if (req.body.password) {
      teacher.password = await bcrypt.hash(req.body.password, 10);
    }
    const updatedTeacher = await teacher.save();
    res.json({
      _id: updatedTeacher._id,
      name: updatedTeacher.name,
      email: updatedTeacher.email,
      token: generateToken(updatedTeacher._id),
    });
  } else {
    res.status(404).json({ message: "Teacher Not Found!" });
  }
});

module.exports = { registerTeacher, authTeacher, updateTeacherProfile };