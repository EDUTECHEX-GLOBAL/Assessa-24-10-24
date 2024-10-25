require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGO_URI;
    if (!mongoURL) {
      throw new Error("MongoDB URI is not defined in .env file");
    }
    await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
