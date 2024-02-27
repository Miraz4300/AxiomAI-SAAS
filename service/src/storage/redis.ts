import Redis from 'ioredis'
import * as dotenv from 'dotenv'
import logger from '../logger/winston'
import { getConfig } from './storage'

dotenv.config()

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number.parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
})

// Log Redis connection events
redis.on('connect', () => {
  logger.info('Connected to Redis')
})

redis.on('error', (error) => {
  logger.error(`Redis error: ${error.message}`)
})

redis.on('close', () => {
  logger.warn('Redis connection closed')
})

redis.on('ready', async () => {
  logger.info('Redis is ready')

  // When Redis is ready, fetch the config from MongoDB and store them in Redis
  const config = await getConfig()
  await redis.set('globalRateLimit', config.siteConfig.rateLimit)
  await redis.set('subscriptionConfig', JSON.stringify(config.subscriptionConfig))
  await redis.set('announcementConfig', JSON.stringify(config.announcementConfig))
  await redis.set('merchConfig', JSON.stringify(config.merchConfig))
  await redis.set('featuresConfig', JSON.stringify(config.featuresConfig))
  logger.info('Config loaded into Redis')
})

export default redis
