const pm2 = require('pm2');
const { exec } = require('child_process');
const pidusage = require('pidusage');
const fs = require('fs');

async function runBenchmark() {
  console.log("Starting benchmark...");
  
  pm2.connect(function(err) {
    if (err) {
      console.error("Error connecting to PM2:", err);
      process.exit(2);
    }
    
    // Start PM2 using the ecosystem file
    pm2.start('ecosystem.config.js', function(err, apps) {
      if (err) {
        console.error("Error starting PM2:", err);
        return pm2.disconnect();
      }
      
      console.log("PM2 cluster started with 4 instances.");
      
      let monitorInterval;
      const statsLog = [];
      
      // Let it warm up for a few seconds
      setTimeout(() => {
        console.log("Starting resource monitor...");
        monitorInterval = setInterval(() => {
          pm2.list((err, list) => {
            if (err) return;
            const pids = list.filter(app => app.name === 'queueos-backend').map(app => app.pid);
            if (pids.length === 0) return;
            
            pidusage(pids, (err, stats) => {
              if (err) return;
              let totalCpu = 0;
              let totalMem = 0;
              for (const pid in stats) {
                totalCpu += stats[pid].cpu;
                totalMem += stats[pid].memory;
              }
              const statStr = `[Monitor] CPU: ${totalCpu.toFixed(2)}% | Memory: ${(totalMem / 1024 / 1024).toFixed(2)} MB`;
              console.log(statStr);
              statsLog.push(statStr);
            });
          });
        }, 5000); // Check every 5 seconds
        
        console.log("Running Artillery High Load Test...");
        const child = exec('npx artillery run high-load-test.yaml');
        
        child.stdout.on('data', (data) => process.stdout.write(data));
        child.stderr.on('data', (data) => process.stderr.write(data));
        
        child.on('close', (code) => {
          console.log(`Artillery test finished with code ${code}`);
          clearInterval(monitorInterval);
          
          // Save stats
          fs.writeFileSync('benchmark-stats.log', statsLog.join('\n'), 'utf8');
          console.log("Saved resource utilization stats to benchmark-stats.log");
          
          console.log("Stopping PM2 cluster...");
          pm2.stop('queueos-backend', (err) => {
            pm2.delete('queueos-backend', (err) => {
              pm2.disconnect();
              console.log("Benchmark complete.");
            });
          });
        });
      }, 3000);
    });
  });
}

runBenchmark();
