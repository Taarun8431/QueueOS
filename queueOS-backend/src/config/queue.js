const { Queue } = require("bullmq");
const { getBullMQConnection } = require("./redis");

const notificationQueue = new Queue(
    "notifications",
    {
        connection: getBullMQConnection(),
    }
);

notificationQueue.on("error", (err) => {
    console.error("BullMQ NotificationQueue error:", err.message);
});

module.exports = notificationQueue;