require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");

// Import routes
const studentAuthRoutes = require("./routes/studentAuthRoutes");
const studentRegisterRoutes = require("./routes/studentRegisterRoutes");
const facultyAuthRoutes = require("./routes/facultyAuthRoutes");
const labInchargeAuthRoutes = require("./routes/labInchargeAuthRoutes");
const facultyRegisterRoutes = require("./routes/facultyRegisterRoutes");
const labInchargeRegisterRoutes = require("./routes/labInchargeRegisterRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const labRoutes = require("./routes/labRoutes");
const teamRoutes = require("./routes/teamRoutes");
const bomRoutes = require("./routes/bomRoutes");
const adminRoutes = require("./routes/adminRoutes");
const materialRoutes = require("./routes/materialRoutes");
const eventRoutes = require("./routes/eventRoutes");

// Initialize app
const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Connect to DB
connectDB();

// -------------------------
// FIX 1: Proper CORS (Mac + Google OAuth)
// -------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://[::1]:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://webtech-ceer.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------------
// ✅ FIX 2: Google OAuth popup communication
// -------------------------
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// Rate Limiting - Apply to all API routes
app.use("/api", apiLimiter);

// -------------------------
// JSON parsing
// -------------------------
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data Sanitization against NoSQL Query Injection (Temporarily disabled for Express 5 compatibility)
// app.use(mongoSanitize());

// -------------------------
// ROUTES (Correct Order)
// -------------------------

// Authentication (Brute-force protection applied)
app.use("/api/student/auth", authLimiter, studentAuthRoutes);
app.use("/api/faculty/auth", authLimiter, facultyAuthRoutes);
app.use("/api/lab/auth", authLimiter, labInchargeAuthRoutes);

// Registration
app.use("/api/student", studentRegisterRoutes);
app.use("/api/faculty", facultyRegisterRoutes);
app.use("/api/lab", labInchargeRegisterRoutes);

// Other functional routes
app.use("/api/faculty", facultyRoutes);
app.use("/api/lab", labRoutes);
app.use("/api", teamRoutes);
app.use("/api", bomRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/material", materialRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/energy", require("./routes/energyRoutes"));
app.use("/api/carbon", require("./routes/carbonRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/instructions", require("./routes/instruction.routes"));
app.use("/api/projects", require("./routes/projectRoutes"));

// -------------------------
// Root Route
// -------------------------
app.get("/", (req, res) => {
  res.send("Server is running");
});

// -------------------------
app.get("/test", (req, res) => {
  res.sendFile(__dirname + "/test-google-auth.html");
});
// -------------------------
// Health Check
// -------------------------
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// -------------------------
// 404 Handler
// -------------------------
app.use((req, res) => {
  console.log(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// -------------------------
// Global Error Handler
// -------------------------
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// -------------------------
// FINAL Server Listener
// -------------------------
const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
