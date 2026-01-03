require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

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
  "http://127.0.0.1:5174"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked Origin:", origin);
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

// -------------------------
// JSON parsing
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
// ROUTES (Correct Order)
// -------------------------

// Authentication
app.use("/api/student/auth", studentAuthRoutes);
app.use("/api/faculty/auth", facultyAuthRoutes);
app.use("/api/lab/auth", labInchargeAuthRoutes);

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
app.use("/api/equipment", require("./routes/equipmentRoutes"));

// -------------------------
// Test Route
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
