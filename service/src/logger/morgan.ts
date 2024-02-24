import fs from 'node:fs'
import type { StreamOptions } from 'morgan'
import morgan from 'morgan'
import * as rfs from 'rotating-file-stream'

const logDirectory = '/app/logs/morgan'
fs.mkdirSync(logDirectory, { recursive: true })

const accessLogStream = rfs.createStream('morgan.log', {
  interval: '1d', // Rotate daily
  path: logDirectory,
  size: '20M', // Rotate every 20 MegaBytes written
  compress: 'gzip', // Compress to gzip
  immutable: true, // Immutable
  maxFiles: 180, // keep upto 180 log files
})

const morganLogger: morgan.Morgan<StreamOptions> = process.env.NODE_ENV === 'production'
  ? morgan('combined', { stream: accessLogStream })
  : morgan('dev')

export default morganLogger
