require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");
const connectDB = require("./config/database.config");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter.middleware");

// auth and registration routess

const studentAuthRoutes = require("./routes/studentAuth.router");
const studentRegisterRoutes = require("./routes/studentRegister.router");
const facultyAuthRoutes = require("./routes/facultyAuth.router");
const labInchargeAuthRoutes = require("./routes/labInchargeAuth.router");
const facultyRegisterRoutes = require("./routes/facultyRegister.router");
const labInchargeRegisterRoutes = require("./routes/labInchargeRegister.router");

// 
const facultyRoutes = require("./routes/faculty.router");
const labRoutes = require("./routes/lab.router");
const teamRoutes = require("./routes/team.router");
const bomRoutes = require("./routes/bom.router");
const adminRoutes = require("./routes/admin.router");
//
const materialRoutes = require("./routes/material.router");
const equipmentRoutes = require("./routes/equipment.router");

// energy routes
const energyRoutes = require("./routes/energy.router");
const carbonRoutes = require("./routes/carbon.router");
// student instrcution 
const instructionRoutes = require("./routes/instruction.router");
// landing page..
const projectRoutes = require("./routes/project.router");
const eventRoutes = require("./routes/event.router");

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

app.use("/api/energy", energyRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/instructions", instructionRoutes);

app.use("/api/projects", projectRoutes);

// -------------------------
// Root Route
// -------------------------
// app.get("/", (req, res) => {
//   res.send("Server is running");
// });

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
