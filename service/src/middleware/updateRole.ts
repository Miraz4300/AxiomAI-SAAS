import fs from 'node:fs'
import path from 'node:path'
import cron from 'node-cron'
import { UserRole } from '../storage/model'
import { userCol } from '../storage/storage'
import { sendSubscriptionEndedMail } from '../utils/mail'

// Function to create a new log file
function createLogFile() {
  const date = new Date()
  const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
  const logDirectory = path.join('/app/logs/cron')
  fs.mkdirSync(logDirectory, { recursive: true })

  const logPath = path.join(logDirectory, `updateRole-${formattedDate}.log`) // Log file format: updateRole-YYYYMMDD.log

  const logStream = fs.createWriteStream(logPath, { flags: 'a' })
  logStream.write(`Cron job started at ${new Date().toLocaleString()}\n`)
  return { logStream, lineCount: 1 } // 1 lines have been written and start counting from 2
}

// Schedule cron job to run every 3 hours
cron.schedule('0 */3 * * *', async () => {
  let { logStream, lineCount } = createLogFile()

  const cursor = userCol.find({ roles: { $in: [UserRole.Premium, UserRole.MVP, UserRole.Support, UserRole.Basic, UserRole['Basic+']] } })

  let operationStarted = false

  for await (const user of cursor) {
    const remark = user.remark
    if (remark && remark.startsWith('Expires: ') && new Date(remark.slice(9)) < new Date()) {
      if (!operationStarted) {
        logStream.write('---------------OPERATION_START---------------\n\n')
        operationStarted = true
      }

      const logMessage = `User Email: ${user.email}\nSubscription: ${UserRole[user.roles[0]]}\nUser Remark: ${user.remark}\nRole updated to: Free\nUpdate Time: ${new Date().toLocaleString()}\n\n`
      logStream.write(logMessage)
      lineCount += logMessage.split('\n').length
      await sendSubscriptionEndedMail(user.email, user.name, UserRole[user.roles[0]], user.remark.slice(11))
      await userCol.updateOne({ _id: user._id }, { $set: { roles: [UserRole.Free], remark: '' } })

      // Check if the log file has reached the limit
      if (lineCount >= 10000) {
        if (operationStarted) {
          logStream.write('----------------OPERATION_END----------------\n')
          operationStarted = false
        }

        logStream.end()
        ;({ logStream, lineCount } = createLogFile())
      }
    }
  }

  if (operationStarted)
    logStream.write('----------------OPERATION_END----------------\n')

  logStream.write(`Cron job finished at ${new Date().toLocaleString()}\n\n\n`)
  logStream.end()
})
