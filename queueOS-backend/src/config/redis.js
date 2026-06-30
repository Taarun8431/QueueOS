const { createClient } = require("redis");

const redisConfig = {
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "goldenrod-popularized-hot-84230.db.redis.io",
    port: 10252,
  },
};

const client = createClient(redisConfig);
const pubClient = createClient(redisConfig);
const subClient = createClient(redisConfig);

client.on("error", (err) => console.log("Redis Client Error", err));
pubClient.on("error", (err) => console.log("Redis PubClient Error", err));
subClient.on("error", (err) => console.log("Redis SubClient Error", err));

async function connect() {
  if (!client.isOpen) await client.connect();
  if (!pubClient.isOpen) await pubClient.connect();
  if (!subClient.isOpen) await subClient.connect();
}

module.exports = {
  client,
  pubClient,
  subClient,
  connect,
};

