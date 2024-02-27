import type { WithId } from 'mongodb'
import { MongoClient, ObjectId } from 'mongodb'
import * as dotenv from 'dotenv'
import logger from '../logger/winston'

dotenv.config()

const url = process.env.MONGODB_URL
if (!url) {
  logger.error('MONGODB_URL is not set')
  process.exit(1)
}

let parsedUrl
try {
  parsedUrl = new URL(url)
}
catch (err) {
  logger.error('Invalid MONGODB_URL', err)
  process.exit(1)
}

const client = new MongoClient(url, {
  // monitorCommands: true, // Enable command monitoring
  maxPoolSize: 450, // Maximum number of connections in the connection pool
  retryWrites: true, // Enable retries for write operations
  retryReads: true, // Enable retries for read operations
})

// client.on('commandStarted', (event) => {
//  logger.info(`Started command ${event.commandName} on ${event.address}`)
// })

// client.on('commandSucceeded', (event) => {
//  logger.info(`Command ${event.commandName} succeeded on ${event.address}`)
// })

// client.on('commandFailed', (event) => {
//   logger.error(`Command ${event.commandName} failed on ${event.address}`)
// })

const dbName = (parsedUrl.pathname && parsedUrl.pathname !== '/') ? parsedUrl.pathname.substring(1) : 'axiomdb'

client.connect()
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB', err)
  })

export { client, dbName, WithId, ObjectId }
