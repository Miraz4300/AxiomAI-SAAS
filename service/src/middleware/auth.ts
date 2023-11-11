import jwt from 'jsonwebtoken'
import type { Request } from 'express'
import { getCacheConfig } from '../storage/config'
import { getUserById } from '../storage/mongo'
import { Status } from '../storage/model'

async function auth(req, res, next) {
  const config = await getCacheConfig()
  if (config.siteConfig.loginEnabled) {
    try {
      const token = req.header('Authorization').replace('Bearer ', '')
      const info = jwt.verify(token, config.siteConfig.loginSalt.trim())
      req.headers.userId = info.userId
      const user = await getUserById(info.userId)
      if (user == null || user.status !== Status.Normal)
        throw new Error('User does not exist')
      else
        next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate', data: null })
    }
  }
  else {
    // fake userid
    req.headers.userId = '6406d8c50afdd643002fa16f'
    next()
  }
}

async function getUserId(req: Request): Promise<string | undefined> {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const config = await getCacheConfig()
    const info = jwt.verify(token, config.siteConfig.loginSalt.trim())
    return info.userId
  }
  catch (error) {

  }
  return null
}

export { auth, getUserId }
