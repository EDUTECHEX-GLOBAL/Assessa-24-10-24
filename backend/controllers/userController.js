const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Userwebapp = require("../models/webapp-models/userModel");
const generateToken = require("../utils/generateToken");

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }

  const userExists = await Userwebapp.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  }

  // ✅ Create user (password will be hashed in the model)
  const user = await Userwebapp.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Error Occurred" });
  }
});

// ✅ Login (Authenticate User)
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Userwebapp.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid Email or Password!" });
  }
});

// Update User Profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await Userwebapp.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: "User Not Found!" });
  }
});

// Forgot Password - Request Reset
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await Userwebapp.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

  await user.save();

  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`; // Change to your frontend URL

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-email-password",
    },
  });

  const mailOptions = {
    from: "no-reply@assessaai.com",
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  };

  await transporter.sendMail(mailOptions);

  res.json({ message: "Password reset link sent to your email" });
});

// Forgot Password - Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await Userwebapp.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Password reset successful. You can now log in." });
});
// Test Password Hashing
const testPasswordHashing = asyncHandler(async (req, res) => {
  const { plainPassword } = req.body; // Expecting plain password in request body
  const hashedPassword = "$2b$10$R0MyMGKvcj50R93vKkuVGuhCFmRJQnK2VeJYj6efR0M/hjIUeuyRy"; // Replace with actual hash from DB

  console.log("Testing bcrypt.compare directly...");
  console.log("Plain Password:", plainPassword);
  console.log("Hashed Password:", hashedPassword);

  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    console.log("bcrypt.compare result:", match);
    res.json({ match });
  } catch (error) {
    console.error("Error during bcrypt.compare:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = { 
  registerUser, 
  authUser, 
  updateUserProfile, 
  requestPasswordReset, 
  resetPassword,
  testPasswordHashing // Ensure this is included
};


