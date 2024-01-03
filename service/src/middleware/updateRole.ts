import fs from 'node:fs'
import cron from 'node-cron'
import { UserRole } from '../storage/model'
import { userCol } from '../storage/mongo'

// Schedule cron job to run every hour
cron.schedule('0 * * * *', async () => {
  const logStream = fs.createWriteStream('/app/logs/updateRole.log', { flags: 'a' }) // Open the log file in append mode
  logStream.write('------------------START------------------\n')
  logStream.write(`Cron job started at ${new Date().toLocaleString()}\n\n\n`)

  const users = await userCol.find({ roles: { $in: [UserRole.Premium, UserRole.MVP, UserRole.Support, UserRole.Basic, UserRole['Basic+']] } }).toArray()

  let updatedUsersCount = 0 // Count of users updated to Free

  for (const user of users) {
    const remark = user.remark
    if (remark && remark.startsWith('Expires on ')) {
      const expiryDateString = remark.slice(11) // Get expiry date from remark
      const expiryDate = new Date(expiryDateString)
      if (expiryDate < new Date()) { // If the expiry date has passed
        user.roles = [UserRole.Free] // Set role to Free
        logStream.write(`User ID: ${user._id}\nUser Email: ${user.email}\nUser Remark: ${user.remark}\nRole updated to: Free\nUpdate Time: ${new Date().toLocaleString()}\n\n\n`)
        user.remark = '' // Clear remark
        await userCol.updateOne({ _id: user._id }, { $set: { roles: [UserRole.Free], remark: '' } }) // Update in database
        updatedUsersCount++
      }
    }
  }

  if (updatedUsersCount === 0)
    logStream.write('No users were updated to Free in this run.\n\n\n')

  logStream.write(`Cron job finished at ${new Date().toLocaleString()}\n`)
  logStream.write('------------------END------------------\n\n\n\n\n')
  logStream.end() // Close the log file
})
