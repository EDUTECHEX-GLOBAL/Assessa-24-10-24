const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userwebappSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    pic: {
      type: String,
      required: true,
      default: "https://example.com/default-pic.png",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userwebappSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Hash only if password is modified

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password for login
userwebappSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



// Generate password reset token
userwebappSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  // Hash the token and store it in the database
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  
  // Set token expiration time (1 hour)
  this.resetPasswordExpire = Date.now() + 3600000;

  return resetToken; // This will be sent to the user via email
};

const Userwebapp = mongoose.model("Userwebapp", userwebappSchema);

module.exports = Userwebapp;
