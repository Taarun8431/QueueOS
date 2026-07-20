require("dotenv").config();
const logger = require("./src/utils/logger");
const http = require("http");
const app = require("./src/app");
const prisma = require("./src/config/prisma");
const { connect: connectRedis, pubClient, subClient } = require("./src/config/redis");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
require("./src/workers/notification.worker");
require("./src/workers/archive.worker");

const PORT = process.env.PORT || process.env.port || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5000",
        "https://queue-os.vercel.app"
      ].filter(Boolean);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

io.adapter(createAdapter(pubClient, subClient));

app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
 
  socket.on("joinQueueRoom", ({ businessId, serviceId }) => {
    const room = `queue:${businessId}:${serviceId}`;
    socket.join(room);
    logger.info(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("✔ Connected to PostgreSQL");
    
    await connectRedis();
    logger.info("✔ Connected to Redis");

    server.listen(PORT, () => {
      logger.info(`🚀 SERVER running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Server startup error:", error);
    process.exit(1);
  }
}

startServer();

// --- GRACEFUL SHUTDOWN LOGIC ---

const gracefulShutdown = async (signal) => {
  logger.warn(`\n[${signal}] Graceful shutdown initiated...`);
  
  // Stop accepting new HTTP requests
  server.close(async () => {
    logger.info("✔ HTTP server closed. Processing active requests...");
    try {
      await prisma.$disconnect();
      logger.info("✔ PostgreSQL connection closed.");
      
      await pubClient.quit();
      await subClient.quit();
      logger.info("✔ Redis connections closed.");
      
      logger.info("✔ Server shutdown sequence complete. Exiting.");
      process.exit(0);
    } catch (err) {
      logger.error("❌ Error during shutdown:", err);
      process.exit(1);
    }
  });

  // Force shutdown if requests hang for more than 10 seconds
  setTimeout(() => {
    logger.error("❌ Forcefully shutting down after 10s timeout due to hanging connections.");
    process.exit(1);
  }, 10000);
};

// OS Signals (Ctrl+C, Docker kill)
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Unexpected Node.js Crashes
process.on("uncaughtException", (err) => {
  logger.error("❌ UNCAUGHT EXCEPTION! Shutting down...", { stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("❌ UNHANDLED REJECTION! Shutting down...", { stack: err.stack });
  server.close(() => {
    process.exit(1);
  });
});
