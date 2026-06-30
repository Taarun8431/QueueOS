const cron = require("node-cron");
const Token = require("../models/token.model");

const archiveOldTokens = async () => {
    try {
        console.log("[ArchiveWorker] Running nightly data archival job...");
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Find tokens older than 30 days that are completed/cancelled/no_show
        const result = await Token.deleteMany({
            createdAt: { $lt: thirtyDaysAgo },
            status: { $in: ["served", "cancelled", "no_show"] }
        });

        if (result.deletedCount > 0) {
            console.log(`[ArchiveWorker] Archived and cleaned up ${result.deletedCount} old tokens.`);
        } else {
            console.log("[ArchiveWorker] No old tokens to archive today.");
        }
    } catch (error) {
        console.error("[ArchiveWorker] Data archival job failed:", error);
    }
};

// Run every night at 2:00 AM
cron.schedule("0 2 * * *", archiveOldTokens);

module.exports = archiveOldTokens;
