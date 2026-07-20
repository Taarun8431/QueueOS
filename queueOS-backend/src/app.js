const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { authLimiter, generalLimiter } = require("./middlewares/rateLimiter.middleware");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");
const helmet = require("helmet");
const xss = require("xss");
const hpp = require("hpp");

const app = express();

// Trust the proxy (Render load balancer) so rate limiting uses the correct client IPs
app.set("trust proxy", 1);

// Dedicated health check endpoint (must be placed BEFORE rate limiters)
app.get("/health", (req, res) => res.status(200).send("OK"));

// Root endpoint for default Render health checks
app.get("/", (req, res) => res.status(200).send("API is running"));

const authRoutes = require("./routes/auth.routes");
const businessRoutes = require("./routes/business.routes");
const serviceRoutes = require("./routes/service.routes");
const queueRoutes = require("./routes/queue.routes");
const notificationRoutes = require("./routes/notification.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const staffRoutes = require("./routes/staff.routes");

app.use(cors({
  origin: function (origin, callback) {
    // Allow absolutely any origin to prevent CORS errors during testing and deployment
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));

// Set security HTTP headers
app.use(helmet());

// Limit JSON payload size to prevent DoS
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against XSS — xss-clean is incompatible with Express v5
// (it tries to write to req.query which is a read-only getter in Express v5).
// Instead, sanitize req.body only, which is safe to mutate.
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};
app.use((req, _res, next) => {
  if (req.body) sanitizeObject(req.body);
  next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

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
