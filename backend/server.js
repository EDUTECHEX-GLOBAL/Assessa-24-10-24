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
app.use(
  cors({
    origin: "http://localhost:3000", // Ensure frontend can communicate with backend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(express.json()); // For parsing application/json

// Routes
const userRoutes = require("./routes/webapp-routes/userRoutes");
const teacherRoutes = require("./routes/teacherRoutes"); 
const adminRoutes = require("./routes/adminRoutes");
const forgotPasswordRoutes = require("./routes/student_forgotpassword_routes"); // Import forgot password routes
const teacherForgotPasswordRoutes = require("./routes/teacher_forgotpassword_routes");
const internRoutes = require("./routes/webapp-routes/internshipPostRoutes");
const skillnaavRoute = require("./routes/skillnaavRoute");
const applicationRoutes = require("./routes/webapp-routes/applicationRoutes");

// Define routes
app.use("/api/users", userRoutes); // User Web App routes
app.use("/api/teachers", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/teacher/forgot-password", teacherForgotPasswordRoutes);
app.use("/api/interns", internRoutes); // Partner to Admin Intern Posts
app.use("/api/applications", applicationRoutes); // Application routes
app.use("/api/skillnaav", skillnaavRoute); // Skillnaav routes
app.use("/api/contact", skillnaavRoute); // Contact route (Verify if this is correct)

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

