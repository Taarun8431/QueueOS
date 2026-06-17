require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { client: redisClient, connect: connectRedis } = require("./src/config/redis");

const PORT = process.env.PORT || process.env.port || 5000;

async function startServer() {
  try {
    await connectDB();
    await connectRedis();

   

    app.listen(PORT, () => {
      console.log(`SERVER running on ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

startServer();
