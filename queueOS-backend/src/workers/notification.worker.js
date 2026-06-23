const { Worker } = require("bullmq");
const Notification = require(
  "../models/notification.model"
);

const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const { userId, message, type } = job.data;

    await Notification.create({
      userId,
      title: "Queue Update",
      message,
      type,
    });

    console.log(`[Worker] Notification saved for user ${userId} | type=${type} | msg="${message}"`);
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: "default",
      password: process.env.REDIS_PASSWORD,
    },
  }
);

notificationWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed — notification persisted to DB`);
});

notificationWorker.on("failed", (job, err) => {
  console.log(`Notification job failed: ${job.id}`, err.message);
});

module.exports = notificationWorker;