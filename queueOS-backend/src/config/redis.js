require("dotenv").config();
const { createClient } = require("redis");

const buildRedisClientOptions = () => {
  const reconnectStrategy = (retries) => {
    if (retries > 20) {
      console.warn("⚠️ Redis reconnection attempts exceeded 20");
      return new Error("Redis reconnection retry limit reached");
    }
    return Math.min(retries * 150, 3000);
  };

  if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith("redis://") || process.env.REDIS_URL.startsWith("rediss://"))) {
    return {
      url: process.env.REDIS_URL,
      socket: { reconnectStrategy },
    };
  }

  const host = process.env.REDIS_HOST || (process.env.REDIS_URL ? process.env.REDIS_URL.split(":")[0] : "127.0.0.1");
  const port = Number(process.env.REDIS_PORT) || (process.env.REDIS_URL && process.env.REDIS_URL.includes(":") ? Number(process.env.REDIS_URL.split(":")[1]) : 6379);
  const password = process.env.REDIS_PASSWORD || undefined;
  const username = process.env.REDIS_USERNAME || "default";

  const config = {
    socket: {
      host,
      port,
      reconnectStrategy,
    },
  };
  if (password) config.password = password;
  if (username) config.username = username;
  return config;
};

const getBullMQConnection = () => {
  if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith("redis://") || process.env.REDIS_URL.startsWith("rediss://"))) {
    try {
      const parsed = new URL(process.env.REDIS_URL);
      return {
        host: parsed.hostname,
        port: Number(parsed.port) || 6379,
        username: parsed.username || "default",
        password: parsed.password || process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
        maxRetriesPerRequest: null,
      };
    } catch {
      // Fall through to standard config below
    }
  }

  const host = process.env.REDIS_HOST || (process.env.REDIS_URL ? process.env.REDIS_URL.split(":")[0] : "127.0.0.1");
  const port = Number(process.env.REDIS_PORT) || (process.env.REDIS_URL && process.env.REDIS_URL.includes(":") ? Number(process.env.REDIS_URL.split(":")[1]) : 6379);
  const password = process.env.REDIS_PASSWORD || undefined;
  const username = process.env.REDIS_USERNAME || "default";

  const conn = {
    host,
    port,
    username,
    maxRetriesPerRequest: null,
  };
  if (password) conn.password = password;
  return conn;
};

const redisOptions = buildRedisClientOptions();

const client = createClient(redisOptions);
const pubClient = createClient(redisOptions);
const subClient = createClient(redisOptions);

client.on("error", (err) => console.error("Redis Client Error:", err.message));
pubClient.on("error", (err) => console.error("Redis PubClient Error:", err.message));
subClient.on("error", (err) => console.error("Redis SubClient Error:", err.message));

async function connect() {
  try {
    const promises = [];
    if (!client.isOpen) promises.push(client.connect());
    if (!pubClient.isOpen) promises.push(pubClient.connect());
    if (!subClient.isOpen) promises.push(subClient.connect());
    await Promise.all(promises);
  } catch (err) {
    console.error("Failed to connect to Redis:", err.message);
    throw err;
  }
}

module.exports = {
  client,
  pubClient,
  subClient,
  connect,
  getBullMQConnection,
};

