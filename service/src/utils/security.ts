import process from 'node:process'
import { createHash } from 'node:crypto'
import * as dotenv from 'dotenv'
import { getCacheConfig } from '../storage/config'

dotenv.config()

export function md5(input: string) {
  input = input + process.env.PASSWORD_MD5_SALT
  const md5 = createHash('md5')
  md5.update(input)
  return md5.digest('hex')
}

// For user verify URL. You can change aes and other methods
export async function getUserVerifyUrl(username: string) {
  const sign = getUserVerify(username)
  const config = await getCacheConfig()
  return `${config.siteConfig.siteDomain}/auth/login/?verifytoken=${sign}`
}

function getUserVerify(username: string) {
  return getVerify(username, '')
}

function getVerify(username: string, key: string) {
  const expired = new Date().getTime() + (6 * 60 * 60 * 1000) // 6 hours
  const sign = `${username}${key}-${expired}`
  return `${sign}-${md5(sign)}`
}

function checkVerify(verify: string) {
  const vs = verify.split('-')
  const sign = vs[vs.length - 1]
  const expired = vs[vs.length - 2]
  vs.splice(vs.length - 2, 2)
  const prefix = vs.join('-')

  // Check if the link has expired
  const currentDate = new Date()
  const expiredDate = new Date(Number(expired))
  if (currentDate > expiredDate)
    return 'expired'

  // Continue with the existing verification process
  if (sign === md5(`${prefix}-${expired}`))
    return prefix.split('|')[0]
  throw new Error('Verification failed')
}

export function checkUserVerify(verify: string) {
  return checkVerify(verify)
}

// For admin verify URL. You can change aes and other methods
export async function getUserVerifyUrlAdmin(username: string) {
  const sign = getUserVerifyAdmin(username)
  const config = await getCacheConfig()
  return `${config.siteConfig.siteDomain}/auth/login/?verifytokenadmin=${sign}`
}

function getUserVerifyAdmin(username: string) {
  return getVerify(username, `|${process.env.ROOT_USER}`)
}

export function checkUserVerifyAdmin(verify: string) {
  return checkVerify(verify)
}

export async function getUserResetPasswordUrl(username: string) {
  const sign = getUserResetPassword(username)
  const config = await getCacheConfig()
  return `${config.siteConfig.siteDomain}/auth/login/?verifyresetpassword=${sign}`
}

function getUserResetPassword(username: string) {
  return getVerify(username, '|rp')
}

export function checkUserResetPassword(verify: string, username: string) {
  const name = checkVerify(verify)
  if (name === 'expired') // Link expired
    return 'expired'
  if (name === username)
    return name
  throw new Error('Verification failed')
}
