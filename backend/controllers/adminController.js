const asyncHandler = require("express-async-handler");
const Admin = require("../models/webapp-models/adminModel");
const generateToken = require("../utils/generateToken");

const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("Admin Login Request Received:", email); // Debugging log

  // Check if admin exists in DB
  const admin = await Admin.findOne({ email });

  if (!admin) {
    console.log("Admin not found in database");
    return res.status(400).json({ message: "Invalid Email or Password!" });
  }

  // Compare entered password with stored hashed password
  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    console.log("Password mismatch");
    return res.status(400).json({ message: "Invalid Email or Password!" });
  }

  console.log("Login Successful for:", admin.email);
  res.json({
    _id: admin._id,
    email: admin.email,
    token: generateToken(admin._id),
  });
});

module.exports = { authAdmin };
