const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/dbConfig");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

dotenv.config(); // Load environment variables

const app = express(); // Initialize express app

// MongoDB Connection
connectDB(); // Establish MongoDB connection

// Enable CORS for frontend-backend communication
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://www.assessaai.com",
  "https://assessaai.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    const cleanedOrigin = origin?.replace(/\/$/, ""); // Remove trailing slash
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

// Middleware
app.use(express.json());

// Routes
const userRoutes = require("./routes/webapp-routes/userRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const forgotPasswordRoutes = require("./routes/student_forgotpassword_routes");
const teacherForgotPasswordRoutes = require("./routes/teacher_forgotpassword_routes");
const internRoutes = require("./routes/webapp-routes/internshipPostRoutes");
const skillnaavRoute = require("./routes/skillnaavRoute");
const applicationRoutes = require("./routes/webapp-routes/applicationRoutes");
const problemsolvingagentRoutes = require("./routes/problemsolvingagentRoutes");
const assessmentuploadformRoutes = require("./routes/assessmentuploadformRoutes");

app.use("/api/users", userRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/teacher/forgot-password", teacherForgotPasswordRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/skillnaav", skillnaavRoute);
app.use("/api/contact", skillnaavRoute);
app.use("/api/ai-agent", problemsolvingagentRoutes);
app.use("/api/assessments", assessmentuploadformRoutes);

// Serve static assets only in production
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

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
