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
        logger.info('Long time no login, token has expired')
        res.send({ status: 'Unauthorized', message: 'Long time no login, token has expired' ?? 'Please authenticate', data: null })
        return
      }

      if (mytoken == null || mytoken !== token) {
        logger.info('Local cache did not find token')
        res.send({ status: 'Unauthorized', message: 'Local cache did not find token' ?? 'Please authenticate', data: null })
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
