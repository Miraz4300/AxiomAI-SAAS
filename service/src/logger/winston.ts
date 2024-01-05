import process from 'node:process'
import winston from 'winston'
import 'winston-daily-rotate-file'

const logger = winston.createLogger({
  level: 'verbose', // Log upto verbose level. Prioritized from 0 to 5 (highest to lowest) - error, warn, info, http, verbose, debug, silly.
  format: winston.format.json(),
  // defaultMeta: { service: 'user-service' }, // For metadata use like this: logger.info('User signed up', { service: 'ROUTES' })
  transports: [
    new winston.transports.DailyRotateFile({
      filename: '/app/logs/winston/errorLogs-%DATE%.log',
      level: 'error', // Log only error messages
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Compress the log files
      maxSize: '20m', // Rotate log files larger than 20 megabytes
      maxFiles: '180d', // Keep logs for 180 days
    }),
    new winston.transports.DailyRotateFile({
      filename: '/app/logs/winston/httpLogs-%DATE%.log',
      level: 'http',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '180d',
    }),
    new winston.transports.DailyRotateFile({
      filename: '/app/logs/winston/combinedLogs-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '40m',
      maxFiles: '180d',
    }),
  ],
})

// Log to the `console (stdout)` with the format:
logger.add(new winston.transports.Console({
  level: 'http',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
}))

export default logger
