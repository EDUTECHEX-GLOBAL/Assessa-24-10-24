const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel");
const Teacher = require("../models/webapp-models/teacherModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try finding user in both Userwebapp and Teacher
      const user = await Userwebapp.findById(decoded._id).select("-password");
      const teacher = await Teacher.findById(decoded._id).select("-password");

      if (user) {
        req.user = user;
      } else if (teacher) {
        req.user = teacher;
      } else {
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
