require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { connect: connectRedis } = require("./src/config/redis");
const { Server } = require("socket.io");
require("./src/workers/notification.worker");

const PORT = process.env.PORT || process.env.port || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});


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
