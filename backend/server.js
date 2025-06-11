const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/dbConfig");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

dotenv.config(); // Load environment variables

const app = express(); // Initialize express app

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://www.assessaai.com",
  "https://assessaai.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    const cleanedOrigin = origin?.replace(/\/$/, "");
    console.log("CORS Origin:", cleanedOrigin);

    if (!origin || allowedOrigins.includes(cleanedOrigin)) {
      callback(null, true);
    } else {
      console.warn("Blocked by CORS:", cleanedOrigin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware to parse JSON

// ✅ Load API Routes BEFORE frontend
app.use("/api/users", require("./routes/webapp-routes/userRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/forgot-password", require("./routes/student_forgotpassword_routes"));
app.use("/api/teacher/forgot-password", require("./routes/teacher_forgotpassword_routes"));
app.use("/api/interns", require("./routes/webapp-routes/internshipPostRoutes"));
app.use("/api/applications", require("./routes/webapp-routes/applicationRoutes"));
app.use("/api/skillnaav", require("./routes/skillnaavRoute"));
app.use("/api/contact", require("./routes/skillnaavRoute"));
app.use("/api/ai-agent", require("./routes/problemsolvingagentRoutes"));
app.use("/api/assessments", require("./routes/assessmentuploadformRoutes"));
app.use("/api/upload", require("./routes/uploadProfilePicRoutes")); // ✅ important

// ✅ Production: Serve React frontend AFTER all routes
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "/client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
