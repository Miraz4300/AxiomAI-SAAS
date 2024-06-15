import fs from 'node:fs'
import path from 'node:path'
import Bull from 'bull'
import { UserRole } from '../storage/model'
import { getFilterData, updateUserRole } from '../storage/storage'
import { hashId } from '../utils/hashSecret'
import { sendSubscriptionEndedMail } from '../utils/mail'
import redis from '../storage/redis'
import logger from '../logger/winston'

const redisConfig = {
  port: redis.options.port,
  host: redis.options.host,
  password: redis.options.password,
}

// Create a Bull queue for handling user updates
const updateQueue = new Bull('updateQueue', { redis: redisConfig })

// Function to get the log file path for the current half-year
function getLogFilePath() {
  const date = new Date()
  const half = Math.floor(date.getMonth() / 6) + 1 // Determine if it's the first or second half of the year
  const formattedDate = `${date.getFullYear()}H${half}` // Format: YYYYH1 or YYYYH2

  const logDirectory = path.join('/app/logs/jobs')
  fs.mkdirSync(logDirectory, { recursive: true })

  return path.join(logDirectory, `updateRole-${formattedDate}.log`)
}

// Function to log messages
function logStream(logMessage) {
  fs.appendFileSync(getLogFilePath(), logMessage, { flag: 'a' })
}

// Function to update user roles and send emails
async function updateUser(job) {
  const { userId, email, name, role, remark } = job.data

  try {
    await updateUserRole(userId, [UserRole.Free])

    const logMessage = [
      '---------------------------------------------',
      `User Email: ${email}`,
      `Subscription: ${role}`,
      `User Remark: ${remark}`,
      'Current role: Free',
      `Update Time: ${new Date().toLocaleString()}`,
      '---------------------------------------------',
      '',
    ].join('\n')
    logStream(logMessage)

    await sendSubscriptionEndedMail(email, name, role, remark.slice(9))
  }
  catch (error) {
    logger.error(`Failed to update user: ${error}`)
  }
}

// Function to check user remarks and schedule updates
async function checkRemark() {
  const users = await getFilterData()
  let scheduledUpdates = 0 // Counter for scheduled updates

  for (const user of users) {
    const remark = user.remark
    if (remark && remark.startsWith('Expires: ')) {
      const expiryDate = new Date(remark.slice(9))
      const now = new Date()
      if (expiryDate <= now) { // Check if the subscription has expired
        await addOrUpdateJob(user._id.toString(), user.email, user.name, UserRole[user.roles[0]], remark)
      }
      else {
        // Else schedule the update for the expiry date
        const delay = expiryDate.getTime() - now.getTime()
        await addOrUpdateJob(user._id.toString(), user.email, user.name, UserRole[user.roles[0]], remark, delay)
        scheduledUpdates++
      }
    }
  }

  logger.info(`Scheduled ${scheduledUpdates} users for update`)
}

// Function to add or update a job in the queue
async function addOrUpdateJob(userId, email, name, role, remark, delay = 0) {
  const hashedUserId = hashId(userId)

  // Check if a job for the user already exists then remove it
  const existingJobs = await updateQueue.getJobs(['delayed', 'waiting', 'active'])
  for (const job of existingJobs) {
    if (job.id === hashedUserId) {
      await job.remove()
      logger.info(`Removed existing job for user ${email}`)
    }
  }
  // Add the new job with the specified delay
  await updateQueue.add({ userId, email, name, role, remark }, { delay, jobId: hashedUserId })
}

// Process jobs in the queue
updateQueue.process(async (job) => {
  await updateUser(job)
})

// Log Bull queue events
updateQueue.on('completed', (job) => {
  logger.info(`Job completed with result ${job.returnvalue}`)
})

updateQueue.on('failed', (job, err) => {
  logger.error(`Job failed with error ${err}`)
})

// Run checkRemark immediately when the application starts
checkRemark().catch(error => logger.error(`Failed to check remark: ${error}`))

// Schedule checkRemark to run every six days
setInterval(() => {
  checkRemark().catch(error => logger.error(`Failed to check remark: ${error}`))
}, 6 * 24 * 60 * 60 * 1000) // 6 days in milliseconds
