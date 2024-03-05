import crypto from 'node:crypto'
import redis from '../storage/redis'

// Hash the user ID to use it as a key in Redis
function hashUserId(userId: string) {
  return crypto.createHash('sha256').update(userId).digest('hex')
}

// Sliding window algorithm to limit the number of requests a user can make in a time window
// Check if a request from a user is allowed under the rate limit cap
export async function isAllowed(userId: string) {
  const hashedUserId = hashUserId(userId)
  const currentTime = new Date().getTime()
  const windowTime = currentTime - 2 * 60 * 60 * 1000 // 2 hours

  // Remove timestamps older than the time window
  await redis.zremrangebyscore(hashedUserId, '-inf', windowTime)

  // Get the number of requests in the time window
  const numRequests = await redis.zcard(hashedUserId)

  const globalRateLimit = await redis.get('globalRateLimit')

  // If the number of requests is less than the maximum allowed, add the current timestamp to the list and return true
  if (numRequests < Number(globalRateLimit)) {
    await redis.zadd(hashedUserId, currentTime, currentTime)
    return { allowed: true }
  }
  else {
    // Get the timestamp of the oldest request in the time window
    const oldRequest = await redis.zrange(hashedUserId, 0, 0, 'WITHSCORES')
    // Calculate the time when the rate limit will reset
    const resetTime = (new Date(Number.parseInt(oldRequest[1]) + 2 * 60 * 60 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return { allowed: false, resetTime }
  }
}
