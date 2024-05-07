import fs from 'node:fs'
import path from 'node:path'
import { UserRole } from '../storage/model'
import { userCol } from '../storage/storage'
import { sendSubscriptionEndedMail } from '../utils/mail'
import logger from '../logger/winston'

// Function to create a new log file
function createLogFile() {
  const date = new Date()
  const half = Math.floor((date.getMonth() / 6)) + 1 // Determine if it's the first or second half of the year
  const formattedDate = `${date.getFullYear()}H${half}` // Format: YYYYH1 or YYYYH2

  const logDirectory = path.join('/app/logs/cron')
  fs.mkdirSync(logDirectory, { recursive: true })

  const logPath = path.join(logDirectory, `updateRole-${formattedDate}.log`)

  const logStream = fs.createWriteStream(logPath, { flags: 'a' })
  return logStream
}

async function checkRemark() {
  const logStream = createLogFile()
  const cursor = userCol.find({ roles: { $in: [UserRole.Premium, UserRole.MVP, UserRole.Support, UserRole.Basic, UserRole['Basic+']] } })
  let scheduledUpdates = 0 // Counter for scheduled updates

  for await (const user of cursor) {
    const remark = user.remark
    if (remark && remark.startsWith('Expires: ')) {
      const expiryDate = new Date(remark.slice(9))
      const now = new Date()
      if (expiryDate <= now) {
        // Update user immediately if the expiry date has passed
        await updateUser(user, logStream)
      }
      else {
        // Schedule user update if expiry date is in the future
        const delay = expiryDate.getTime() - now.getTime() + 10 * 1000 // 10 seconds after remark's date
        setTimeout(async () => {
          await updateUser(user, logStream)
        }, delay)
        scheduledUpdates++
      }
    }
  }

  logger.info('Remark check finished')
  logger.info(`Scheduled ${scheduledUpdates} users for update`)
  logStream.end()
}

async function updateUser(user, logStream) {
  try {
    const logMessage = [
      '---------------------------------------------',
      `User Email: ${user.email}`,
      `Subscription: ${UserRole[user.roles[0]]}`,
      `User Remark: ${user.remark}`,
      'Role updated to: Free',
      `Update Time: ${new Date().toLocaleString()}`,
      '---------------------------------------------',
      '',
    ].join('\n')
    logStream.write(logMessage)
    await sendSubscriptionEndedMail(user.email, user.name, UserRole[user.roles[0]], user.remark.slice(9))
    await userCol.updateOne({ _id: user._id }, { $set: { roles: [UserRole.Free], remark: '' } })
    logger.info(`User ${user.email} updated to Free role`)
  }
  catch (error) {
    logger.error(`Failed to send mail or update user: ${error}`)
  }
}

// Run checkRemark immediately when the application starts
checkRemark().catch(error => logger.error(`Failed to check remark: ${error}`))

// Then schedule checkRemark to run every two days
setInterval(() => {
  checkRemark().catch(error => logger.error(`Failed to check remark: ${error}`))
}, 2 * 24 * 60 * 60 * 1000) // 2 days in milliseconds
