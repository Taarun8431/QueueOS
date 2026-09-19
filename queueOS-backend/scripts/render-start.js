const { execSync } = require("child_process");
const path = require("path");

async function start() {
  console.log("🚀 Initializing QueueOS on Render...");

  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL environment variable is not defined!");
  } else {
    console.log("🔄 Applying Prisma schema (prisma db push)...");
    const maxRetries = 3;
    let pushSuccess = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        execSync("npx prisma db push --accept-data-loss", {
          stdio: "inherit",
          cwd: path.resolve(__dirname, ".."),
        });
        pushSuccess = true;
        console.log("✔ Prisma database schema synchronized successfully.");
        break;
      } catch (err) {
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} to sync database failed.`);
        if (attempt < maxRetries) {
          console.log("⏳ Retrying database synchronization in 5 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    if (!pushSuccess) {
      const sanitizedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@");
      console.error(`
================================================================================
❌ DATABASE CONNECTION FAILED (Prisma Error P1001)
--------------------------------------------------------------------------------
Could not connect to database at:
  ${sanitizedUrl}

Top causes on Render & how to resolve:

1. EXPIRED FREE DATABASE:
   Render's free PostgreSQL tier automatically expires after 30 days.
   If expired or suspended:
     a) Go to Render Dashboard -> New + -> PostgreSQL.
     b) Create a new free database instance.
     c) Copy the new 'Internal Database URL' (or 'External Database URL').
     d) Update DATABASE_URL in your Web Service's Environment settings.

2. REGION MISMATCH (Internal vs External URL):
   The internal host 'dpg-xxxx-a' is ONLY reachable if both your web service
   and database are in the EXACT SAME REGION (e.g., Oregon).
   If they are in different regions, use the 'External Database URL'
   (ends with .oregon-postgres.render.com?sslmode=require).

3. DATABASE PROVISIONING / SUSPENDED:
   Verify that your PostgreSQL database status is 'Available' in Render.
================================================================================
`);
      console.log("⚠️ Starting web server in fallback mode to allow health checks and logs...");
    }
  }

  // Load and start server
  require(path.resolve(__dirname, "../server.js"));
}

start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
