import crypto from 'node:crypto'

// Hash the user ID to use it as a key in Redis or other storage
export function hashUserId(userId: string) {
  return crypto.createHash('sha256').update(userId).digest('hex')
}
