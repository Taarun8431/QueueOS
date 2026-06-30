require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { connect: connectRedis, pubClient, subClient } = require("./src/config/redis");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
require("./src/workers/notification.worker");
require("./src/workers/archive.worker");

const PORT = process.env.PORT || process.env.port || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.adapter(createAdapter(pubClient, subClient));

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

 
  socket.on("joinQueueRoom", ({ businessId, serviceId }) => {
    const room = `queue:${businessId}:${serviceId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

async function startServer() {
  try {
    await connectDB();
    await connectRedis();

    server.listen(PORT, () => {
      console.log(`SERVER running on ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}
startServer();

// --- GRACEFUL SHUTDOWN LOGIC ---

const gracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Graceful shutdown initiated...`);
  
  // Stop accepting new HTTP requests
  server.close(async () => {
    console.log("✔ HTTP server closed.");
    try {
      const mongoose = require("mongoose");
      await mongoose.connection.close();
      console.log("✔ MongoDB connection closed.");
      
      await pubClient.quit();
      await subClient.quit();
      console.log("✔ Redis connections closed.");
      
      process.exit(0);
    } catch (err) {
      console.error("❌ Error during shutdown:", err);
      process.exit(1);
    }
  });

  // Force shutdown if requests hang for more than 10 seconds
  setTimeout(() => {
    console.error("❌ Forcefully shutting down after 10s timeout");
    process.exit(1);
  }, 10000);
};

// OS Signals (Ctrl+C, Docker kill)
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Unexpected Node.js Crashes
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...", err);
  server.close(() => {
    process.exit(1);
  });
});
