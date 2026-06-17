const { createClient } = require("redis");

const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "goldenrod-popularized-hot-84230.db.redis.io",
    port: 10252,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

async function connect() {
  if (!client.isOpen) {
    await client.connect();
  }
}

module.exports = {
  client,
  connect,
};

