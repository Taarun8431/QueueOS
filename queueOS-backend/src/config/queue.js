const { Queue } = require("bullmq");

const notificationQueue = new Queue(
    "notifications",
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            username: "default",
        },
    }
);

module.exports = notificationQueue;