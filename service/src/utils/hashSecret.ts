import crypto from 'node:crypto'

// Hash the user ID to use it as a key in Redis or other storage
export function hashId(userId: string) {
  return crypto.createHash('sha256').update(userId).digest('hex')
}

// Hash the user Email to use it as a key in Redis or other storage
export function hashEmail(email: string) {
  return crypto.createHash('sha256').update(email).digest('hex')
}
