module.exports = {
  apps: [
    {
      name: 'queueos-backend',
      script: './server.js',
      instances: 4, // Run 4 instances in cluster mode
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      }
    }
  ]
};
