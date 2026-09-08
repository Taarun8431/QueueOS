const { Worker } = require("bullmq");
const prisma = require("../config/prisma");
const { getBullMQConnection } = require("../config/redis");

const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const { userId, message, type } = job.data;

    await prisma.notification.create({
      data: {
        userId,
        title: "Queue Update",
        message,
        type,
      }
    });

    console.log(`[Worker] Notification saved for user ${userId} | type=${type} | msg="${message}"`);
  },
  {
    connection: getBullMQConnection(),
  }
);

notificationWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed — notification persisted to DB`);
});

notificationWorker.on("failed", (job, err) => {
  console.log(`[Worker] Notification job failed: ${job.id}`, err.message);
});

notificationWorker.on("error", (err) => {
  console.error("[Worker] Notification worker error:", err.message);
});

module.exports = notificationWorker;