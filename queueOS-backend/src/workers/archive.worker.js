const cron = require("node-cron");
const prisma = require("../config/prisma");

const archiveOldTokens = async () => {
    try {
        console.log("[ArchiveWorker] Running nightly data archival job...");
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await prisma.token.deleteMany({
            where: {
                createdAt: { lt: thirtyDaysAgo },
                status: { in: ["served", "cancelled", "no_show"] }
            }
        });

        if (result.count > 0) {
            console.log(`[ArchiveWorker] Archived and cleaned up ${result.count} old tokens.`);
        } else {
            console.log("[ArchiveWorker] No old tokens to archive today.");
        }
    } catch (error) {
        console.error("[ArchiveWorker] Data archival job failed:", error);
    }
};

cron.schedule("0 2 * * *", archiveOldTokens);

module.exports = archiveOldTokens;
