require('dotenv').config();
const { client: redisClient, connect } = require('../src/config/redis');

async function measureCache() {
  try {
    await connect();
    const info = await redisClient.info('stats');
    
    // Parse the info string to extract keyspace_hits and keyspace_misses
    const hitsMatch = info.match(/keyspace_hits:(\d+)/);
    const missesMatch = info.match(/keyspace_misses:(\d+)/);
    
    const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
    const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
    const total = hits + misses;
    
    const hitRatio = total > 0 ? ((hits / total) * 100).toFixed(2) : 0;
    
    console.log("=== Redis Cache Metrics ===");
    console.log(`Hits: ${hits}`);
    console.log(`Misses: ${misses}`);
    console.log(`Total Requests: ${total}`);
    console.log(`Hit Ratio: ${hitRatio}%`);
    console.log("===========================");
    
    process.exit(0);
  } catch (error) {
    console.error("Error fetching Redis stats:", error);
    process.exit(1);
  }
}

measureCache();
