import winston from 'winston'
import LokiTransport from 'winston-loki'
import 'winston-daily-rotate-file'
import * as dotenv from 'dotenv'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

const logger = winston.createLogger({
  level: 'verbose', // Log upto verbose level. Prioritized from 0 to 5 (highest to lowest) - error, warn, info, http, verbose, debug, silly.
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  // defaultMeta: { service: 'EXPRESS-ROUTER' }, // For metadata: logger.info('User signed up', { service: 'ROUTES' })
  transports: isProduction
    ? [
        new winston.transports.DailyRotateFile({
          filename: '/app/logs/winston/error-%DATE%.log',
          level: 'error', // Log only error messages
          datePattern: 'YYYY-MM', // Rotate log files every month
          zippedArchive: true, // Compress the log files
          maxSize: '20m', // Rotate log files larger than 20 megabytes
          maxFiles: '365d', // Keep logs for 365 days before deleting
        }),
        new winston.transports.DailyRotateFile({
          filename: '/app/logs/winston/warn-%DATE%.log',
          level: 'warn', // Log only warn messages
          datePattern: 'YYYY-MM',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '365d',
        }),
        new winston.transports.DailyRotateFile({
          filename: '/app/logs/winston/combined-%DATE%.log',
          datePattern: 'YYYY-MM',
          zippedArchive: true,
          maxSize: '40m',
          maxFiles: '365d',
        }),
        new LokiTransport({
          host: process.env.LOKI_HOST,
          basicAuth: process.env.LOKI_BASICAUTH,
          json: true,
          replaceTimestamp: true,
          labels: { environment: process.env.NODE_ENV },
          onConnectionError: err => console.error(err),
        }),
      ]
    : [],
})

// Log to console(stdout)
logger.add(new winston.transports.Console({
  level: 'http',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY/MM/DD - HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${level}: ${timestamp} | ${message}`
    }),
  ),
}))

export default logger
