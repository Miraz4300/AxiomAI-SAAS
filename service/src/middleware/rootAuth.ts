import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { Status, UserRole } from '../storage/model'
import { getUser, getUserById } from '../storage/storage'
import { authProxyHeaderName, getCacheConfig } from '../storage/config'
import type { AuthJwtPayload } from '../types'
import logger from '../logger/winston'
import { tokenMap } from './auth'

dotenv.config()

async function rootAuth(req, res, next) {
  const config = await getCacheConfig()

  if (config.siteConfig.authProxyEnabled) {
    try {
      const username = req.header(authProxyHeaderName)
      const user = await getUser(username)
      req.headers.userId = user._id
      if (user == null || user.status !== Status.Normal || !user.roles.includes(UserRole.Admin))
        res.send({ status: 'Fail', message: 'No permission.', data: null })
      else
        next()
    }
    catch (error) {
      logger.error(`Auth proxy configuration error: Missing proxy header ${authProxyHeaderName}.`)
      res.send({ status: 'Unauthorized', message: error.message ?? `Please config auth proxy (usually is nginx) add set proxy header ${authProxyHeaderName}.`, data: null })
    }
    return
  }

  if (config.siteConfig.loginEnabled) {
    try {
      const token = req.header('Authorization').replace('Bearer ', '')
      const info = jwt.verify(token, config.siteConfig.loginSalt.trim()) as AuthJwtPayload
      req.headers.userId = info.userId
      const user = await getUserById(info.userId)
      if (user == null || user.status !== Status.Normal || !user.roles.includes(UserRole.Admin)) {
        res.send({ status: 'Fail', message: '⚠️ No permission', data: null })
        return
      }
      // Custom authentication permissions
      const userId = info.userId.toString()
      const mytoken = tokenMap.get(userId)
      const timestamp2 = tokenMap.get(`${userId}time`)
      const now = Date.now()
      tokenMap.set(`${userId}time`, Date.now())
      const seconds = (now - timestamp2) / 1000 / 60
      // default logout time is 10080 minutes or 7 days
      let logoutMin = Number.parseInt(process.env.LOGOUT_MIN, 10080)
      if (logoutMin == null)
        logoutMin = 10080

      if (seconds > logoutMin) {
        logger.warn(`The user with ID ${userId} has been inactive for an extended period, and their token has expired.`)
        res.send({ status: 'Unauthorized', message: 'Long time no login, token has expired' ?? 'Please authenticate', data: null })
        return
      }

      if (mytoken == null) {
        logger.warn(`No token found in the local cache for user ${userId}.`)
        res.send({ status: 'Unauthorized', message: 'Local cache did not find token' ?? 'Please authenticate', data: null })
        return
      }

      if (mytoken !== token) {
        logger.warn(`Activity has been detected for user ${userId} from an old session. The old token has now expired.`)
        res.send({ status: 'Unauthorized', message: 'Old session token has expired' ?? 'Please authenticate', data: null })
        return
      }

      if (!info.root) {
        logger.warn('The current user is not a management user and cannot call the administrator interface')
        res.send({ status: 'Fail', message: '⚠️ No permission', data: null })
        return
      }
      next()
    }
    catch (error) {
      logger.error(`Authentication error(rootAuth): ${error.message}`)
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate', data: null })
    }
  }
  else {
    res.send({ status: 'Fail', message: '⚠️ No permission', data: null })
  }
}

async function isAdmin(userId: string) {
  const user = await getUserById(userId)
  return user != null && user.status === Status.Normal && user.roles.includes(UserRole.Admin)
}

export { rootAuth, isAdmin }
