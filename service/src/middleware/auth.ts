import jwt from 'jsonwebtoken'
import type { Request } from 'express'
import { authProxyHeaderName, getCacheConfig } from '../storage/config'
import { createUser, getUser, getUserById } from '../storage/storage'
import { Status, UserRole } from '../storage/model'
import type { AuthJwtPayload } from '../types'
import logger from '../logger/winston'

export const tokenMap = new Map<string, any>()

async function auth(req, res, next) {
  const config = await getCacheConfig()

  if (config.siteConfig.authProxyEnabled) {
    try {
      const username = req.header(authProxyHeaderName)
      if (!username) {
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
      const mytoken = tokenMap.get(userId)
      const timestamp2 = tokenMap.get(`${userId}time`)
      const now = Date.now()
      tokenMap.set(`${userId}time`, Date.now())
      const seconds = (now - timestamp2) / 1000 / 60
      //  let logoutMin = process.env.LOGOUT_MIN;
      // default logout time is 10080 minutes or 7 days
      let logoutMin = Number.parseInt(process.env.LOGOUT_MIN, 10080)

      if (logoutMin == null)
        logoutMin = 10080

      if (seconds > logoutMin) {
        logger.info('Long time no login, token has expired')
        res.send({ status: 'Unauthorized', message: 'Long time no login, token has expired' ?? 'Please authenticate.', data: null })

        return
      }

      if (mytoken == null || mytoken !== token) {
        logger.info('Local cache did not find token')
        res.send({ status: 'Unauthorized', message: 'Local cache did not find token' ?? 'Please authenticate.', data: null })

        return
      }
      next()
    }
    catch (error) {
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
        globalThis.console.error(`Please config auth proxy (usually is nginx) add set proxy header ${authProxyHeaderName}.`)
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
