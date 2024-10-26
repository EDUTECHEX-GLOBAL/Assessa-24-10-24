const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURL =
      process.env.MONGO_URI ||
      "mongodb+srv://anu:8Ng3y8FdQND3Jyxw@cluster0.b582c.mongodb.net/Assessa";
    await mongoose.connect(mongoURL);
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
