import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { Status } from '../storage/model'
import { getUserById } from '../storage/mongo'
import { getCacheConfig } from '../storage/config'

dotenv.config()

async function rootAuth(req, res, next) {
  const config = await getCacheConfig()
  if (config.siteConfig.loginEnabled) {
    try {
      const token = req.header('Authorization').replace('Bearer ', '')
      const info = jwt.verify(token, config.siteConfig.loginSalt.trim())
      req.headers.userId = info.userId
      const user = await getUserById(info.userId)
      if (user == null || user.status !== Status.Normal || user.email.toLowerCase() !== process.env.ROOT_USER)
        res.send({ status: 'Fail', message: 'No permission.', data: null })
      else
        next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    res.send({ status: 'Fail', message: 'No permission.', data: null })
  }
}

export { rootAuth }
