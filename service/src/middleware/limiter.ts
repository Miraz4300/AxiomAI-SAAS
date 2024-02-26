import { rateLimit } from 'express-rate-limit'
import * as dotenv from 'dotenv'
import requestIp from 'request-ip'
import { isNotEmptyString } from '../utils/is'

dotenv.config()

const MAX_REQUEST_PER_HOUR = process.env.MAX_REQUEST_PER_HOUR
const AUTH_MAX_REQUEST_PER_MINUTE = process.env.AUTH_MAX_REQUEST_PER_MINUTE

const maxCount = (isNotEmptyString(MAX_REQUEST_PER_HOUR) && !Number.isNaN(Number(MAX_REQUEST_PER_HOUR)))
  ? Number.parseInt(MAX_REQUEST_PER_HOUR)
  : 0 // 0 means unlimited
const authMaxCount = (isNotEmptyString(AUTH_MAX_REQUEST_PER_MINUTE) && !Number.isNaN(Number(AUTH_MAX_REQUEST_PER_MINUTE)))
  ? Number.parseInt(AUTH_MAX_REQUEST_PER_MINUTE)
  : 0 // 0 means unlimited

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Maximum number of accesses within an hour
  max: maxCount,
  statusCode: 200, // 200 means success，but it will send the error message.
  keyGenerator: (req, _) => {
    return requestIp.getClientIp(req) // IP address from requestIp.mw(), as opposed to req.ip
  },
  message: async (req, res) => {
    const retryAfter = Math.ceil(res.get('Retry-After') / 60)
    res.send({ status: 'Fail', message: `Your IP address has made excessive requests. Try again after **${retryAfter} minutes** later.`, data: null })
  },
})

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // Maximum number of accesses within a minute
  max: authMaxCount,
  statusCode: 200, // 200 means success，but it will send the error message.
  keyGenerator: (req, _) => {
    return requestIp.getClientIp(req) // IP address from requestIp.mw(), as opposed to req.ip
  },
  message: async (req, res) => {
    res.send({ status: 'Fail', message: 'Your IP address has made excessive requests within 1 minute', data: null })
  },
})

export { limiter, authLimiter }
