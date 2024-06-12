import jwt from 'jsonwebtoken'
import type { Request } from 'express'
import { authProxyHeaderName, getCacheConfig } from '../storage/config'
import { createUser, getUser } from '../storage/storage'
import { Status, UserRole } from '../storage/model'
import type { AuthJwtPayload } from '../types'
import { hashUserId } from '../utils/hashID'
import redis from '../storage/redis'
import logger from '../logger/winston'

async function auth(req, res, next) {
  const config = await getCacheConfig()

  if (config.siteConfig.authProxyEnabled) {
    try {
      const username = req.header(authProxyHeaderName)
      if (!username) {
        logger.error(`Auth proxy configuration error: Missing proxy header ${authProxyHeaderName}.`)
        res.send({ status: 'Unauthorized', message: `Please config auth proxy (usually is nginx) add set proxy header ${authProxyHeaderName}.`, data: null })
        return
      }
      const user = await getUser(username)
      req.headers.userId = user._id.toString()
      next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? `Please config auth proxy (usually is nginx) add set proxy header ${authProxyHeaderName}.`, data: null })
    }
    return
  }

  if (config.siteConfig.loginEnabled) {
    try {
      const token = req.header('Authorization').replace('Bearer ', '')
      const info = jwt.verify(token, config.siteConfig.loginSalt.trim()) as AuthJwtPayload
      req.headers.userId = info.userId

      // Custom authentication permissions
      const userId = info.userId.toString()
      const hashedUserId = hashUserId(userId)

      // Get token and timestamp from Redis
      const mytoken = await redis.get(hashedUserId)
      const timestamp2 = await redis.get(`${hashedUserId}time`)
      const now = Date.now()
      await redis.set(`${hashedUserId}time`, Date.now())

      const seconds = (now - Number.parseInt(timestamp2)) / 1000 / 60
      //  let logoutMin = process.env.LOGOUT_MIN;
      // default logout time is 10080 minutes or 7 days
      let logoutMin = Number.parseInt(process.env.LOGOUT_MIN, 10080)

      if (logoutMin == null)
        logoutMin = 10080

      if (seconds > logoutMin) {
        logger.warn(`The user with ID ${userId} has been inactive for an extended period, and their token has expired.`)
        res.send({ status: 'Unauthorized', message: 'Long time no login, token has expired' ?? 'Please authenticate.', data: null })
        return
      }

      if (mytoken == null) {
        logger.warn(`No token found in the local cache for user ${userId}.`)
        res.send({ status: 'Unauthorized', message: 'Local cache did not find token' ?? 'Please authenticate.', data: null })
        return
      }

      if (mytoken !== token) {
        logger.warn(`Activity has been detected for user ${userId} from an old session. The old token has now expired.`)
        res.send({ status: 'Unauthorized', message: 'Old session token has expired' ?? 'Please authenticate.', data: null })
        return
      }
      next()
    }
    catch (error) {
      logger.error(`Authentication error: ${error.message}`)
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate', data: null })
    }
  }
  else {
    // fake userid
    req.headers.userId = '6406d8c50a4dd643292fa16f'
    next()
  }
}

async function getUserId(req: Request): Promise<string | undefined> {
  let token: string
  try {
    const config = await getCacheConfig()
    if (config.siteConfig.authProxyEnabled) {
      const username = req.header(authProxyHeaderName)
      if (!username) {
        logger.error(`Auth proxy configuration error: Missing proxy header ${authProxyHeaderName}.`)
        return null
      }
      let user = await getUser(username)
      if (user == null) {
        const isRoot = username.toLowerCase() === process.env.ROOT_USER
        user = await createUser(username, '', isRoot ? [UserRole.Admin] : [UserRole.Free], Status.Normal, 'Created by auth proxy.')
      }
      return user._id.toString()
    }

    // no Authorization info is received without login
    if (!(req.header('Authorization') as string))
      return null // '6406d8c50a4dd643292fa16f'
    token = req.header('Authorization').replace('Bearer ', '')

    const info = jwt.verify(token, config.siteConfig.loginSalt.trim()) as AuthJwtPayload
    return info.userId
  }
  catch (error) {
    logger.error(`auth middleware getUserId error from token: ${token} `, error.message)
  }
  return null
}

export { auth, getUserId }
