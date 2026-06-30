const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define custom log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  })
);

// Configure the Winston logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // 1. Output all logs to the console (Railway/Docker will capture this)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    }),
    
    // 2. Output ERROR logs to a rotating local file
    new DailyRotateFile({
      filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d', // Keep logs for 14 days
      zippedArchive: true, // Compress old logs
    }),

    // 3. Output ALL logs to a rotating local file
    new DailyRotateFile({
      filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ]
});

module.exports = logger;
