require("dotenv").config();
const logger = require("./src/utils/logger");
const http = require("http");
const app = require("./src/app");
const prisma = require("./src/config/prisma");
const { connect: connectRedis, pubClient, subClient } = require("./src/config/redis");
const { Server } = require("socket.io");
require("./src/workers/notification.worker");
require("./src/workers/archive.worker");

const PORT = process.env.PORT || process.env.port || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow absolutely any origin to prevent CORS errors during testing and deployment
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

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
    try {
      await prisma.$connect();
      logger.info("✔ Connected to PostgreSQL");
    } catch (dbErr) {
      logger.error("⚠️ PostgreSQL connection initial check:", dbErr.message);
    }

    try {
      await connectRedis();
      logger.info("✔ Connected to Redis");
    } catch (redisErr) {
      logger.error("⚠️ Redis connection initial check:", redisErr.message);
    }

    server.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 SERVER running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Server startup fatal error:", error);
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
      
      if (pubClient.isOpen) await pubClient.quit();
      if (subClient.isOpen) await subClient.quit();
      logger.info("✔ Redis connections closed.");
      
      logger.info("✔ Server shutdown sequence complete. Exiting.");
      process.exit(0);
    } catch (err) {
      logger.error("❌ Error during shutdown:", err.message);
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
  logger.error("❌ UNCAUGHT EXCEPTION!", { message: err.message, stack: err.stack });
  if (err.code === "ECONNREFUSED" || err.message?.includes("Redis") || err.message?.includes("connect")) {
    logger.warn("⚠️ Network/connection exception captured. Continuing execution.");
    return;
  }
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("❌ UNHANDLED REJECTION!", { message: err?.message, stack: err?.stack });
});
