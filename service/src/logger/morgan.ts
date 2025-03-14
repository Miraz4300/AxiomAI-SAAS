import fs from 'node:fs'
import path from 'node:path'
import morgan from 'morgan'
import * as rfs from 'rotating-file-stream'

// Create logs directory and setup rotating file stream in one go
const logsDir = path.join(process.cwd(), 'logs', 'morgan')
fs.mkdirSync(logsDir, { recursive: true })

const accessLogStream = rfs.createStream('morgan.log', {
  interval: '1d', // Rotate daily
  path: path.join(logsDir),
  size: '20M', // Rotate every 20 MegaBytes written
  compress: 'gzip', // Compress to gzip
  immutable: true, // Immutable
  maxFiles: 180, // keep upto 180 log files
})

const morganLogger = morgan('combined', { stream: accessLogStream })

export default morganLogger
