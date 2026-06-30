const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { authLimiter, generalLimiter } = require("./middlewares/rateLimiter.middleware");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

const app = express();

const authRoutes = require("./routes/auth.routes");
const businessRoutes = require("./routes/business.routes");
const serviceRoutes = require("./routes/service.routes");
const queueRoutes = require("./routes/queue.routes");
const notificationRoutes = require("./routes/notification.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const staffRoutes = require("./routes/staff.routes");

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Strict rate limit on auth endpoints — brute force protection
app.use("/api/auth", authLimiter);

// General rate limit on all other API routes
app.use("/api", generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/staff", staffRoutes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

module.exports = app;
