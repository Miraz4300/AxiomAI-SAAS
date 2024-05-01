import * as fs from 'node:fs'
import * as path from 'node:path'
import * as url from 'node:url'
import nodemailer from 'nodemailer'
import type { MailConfig } from '../storage/model'
import { getCacheConfig } from '../storage/config'
import logger from '../logger/winston'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

// Load templates at startup and caches them in memory
const templatesPath = path.join(__dirname, 'templates')
const templateFiles = fs.readdirSync(templatesPath)
const templates = templateFiles.reduce((acc, file) => {
  const filePath = path.join(templatesPath, file)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  return { ...acc, [file]: fileContent }
}, {})
logger.info('Loaded all email templates into RAM')

// Create a single transporter when the application starts. Requires a restart to apply changes
let transporter: nodemailer.Transporter | null = null
async function getTransporter(config: MailConfig) {
  if (!transporter) {
    logger.info('Creating new SMTP transporter')
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpTsl,
      auth: {
        user: config.smtpUserName,
        pass: config.smtpPassword,
      },
      pool: true,
    })
    logger.info(`SMTP transporter created: ${config.smtpHost}`)
  }
  else {
    logger.info('Using existing SMTP transporter')
  }
  return transporter
}

// For verification mail
export async function sendVerifyMail(toMail: string, verifyUrl: string) {
  const config = (await getCacheConfig())
  let mailHtml = templates['mail.template.html']
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `Verify your email to create your ${config.siteConfig.siteTitle} account`, mailHtml, config.mailConfig)
  logger.info('Verification email sent.')
}

// For subscription mail. When subscription is activated
export async function sendSubscriptionMail(toMail: string, userName: string, roleName: string, trxMethod: string, trxAmount: string, trxID: string, activeDate: string, remark: string) {
  const config = (await getCacheConfig())
  let mailHtml = templates['mail.subscription.template.html']
  mailHtml = mailHtml.replace(/\${USER_EMAIL}/g, toMail)
  mailHtml = mailHtml.replace(/\${USER_NAME}/g, userName)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_NAME}/g, roleName)
  mailHtml = mailHtml.replace(/\${PAYMENT_METHOD}/g, trxMethod)
  mailHtml = mailHtml.replace(/\${PAYMENT_AMOUNT}/g, trxAmount)
  mailHtml = mailHtml.replace(/\${TRANSACTION_ID}/g, trxID)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_ACTIVE_DATE}/g, activeDate)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_END_DATE}/g, remark)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  mailHtml = mailHtml.replace(/\${SITE_DOMAIN}/g, config.siteConfig.siteDomain)
  sendMail(toMail, `Your ${roleName} Subscription Has Activated!`, mailHtml, config.mailConfig)
  logger.info('Subscription activation email sent.')
}

// For subscription mail. When subscription is ended
export async function sendSubscriptionEndedMail(toMail: string, userName: string, roleName: string, remark: string) {
  const config = (await getCacheConfig())
  let mailHtml = templates['mail.subscriptionEnd.template.html']
  mailHtml = mailHtml.replace(/\${USER_EMAIL}/g, toMail)
  mailHtml = mailHtml.replace(/\${USER_NAME}/g, userName)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_NAME}/g, roleName)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_END_DATE}/g, remark)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  mailHtml = mailHtml.replace(/\${SITE_DOMAIN}/g, config.siteConfig.siteDomain)
  sendMail(toMail, ` Important Notice: Your ${roleName} Subscription Has Ended`, mailHtml, config.mailConfig)
  logger.info('Subscription expiration email sent.')
}

// For admin approve mail. When registration review is enabled, this mail will be sent to the admin
export async function sendVerifyMailAdmin(toMail: string, verifyName: string, verifyUrl: string) {
  const config = (await getCacheConfig())
  let mailHtml = templates['mail.admin.template.html']
  mailHtml = mailHtml.replace(/\${TO_MAIL}/g, verifyName)
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `Account Application for ${config.siteConfig.siteTitle}`, mailHtml, config.mailConfig)
  logger.info('Admin approve email sent')
}

// For reset password mail (forgot password)
export async function sendResetPasswordMail(toMail: string, verifyUrl: string) {
  const config = (await getCacheConfig())
  let mailHtml = templates['mail.resetpassword.template.html']
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `Reset your ${config.siteConfig.siteTitle} account password`, mailHtml, config.mailConfig)
  logger.info('Reset password email sent.')
}

// For notice mail. When registration review is enabled, this mail will be sent to the user
export async function sendNoticeMail(toMail: string) {
  const config = (await getCacheConfig())
  let mailHtml = templates['mail.notice.template.html']
  mailHtml = mailHtml.replace(/\${SITE_DOMAIN}/g, config.siteConfig.siteDomain)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `Account opening verification for ${config.siteConfig.siteTitle} account`, mailHtml, config.mailConfig)
  logger.info('Notice email sent.')
}

// For test mail (test smtp settings)
export async function sendTestMail(toMail: string, config: MailConfig) {
  return sendMail(toMail, 'Test mail', 'This is test mail', config)
}

// Send mail function
async function sendMail(toMail: string, subject: string, html: string, config: MailConfig) {
  const mailOptions = {
    from: `AxiomAI <${config.smtpSenderEmail || config.smtpUserName}>`,
    to: toMail,
    subject,
    html,
  }

  const transporter = await getTransporter(config)
  try {
    const info = await transporter.sendMail(mailOptions)
    logger.info(`Email sent: ${info.messageId}`)
    return info.messageId
  }
  catch (error) {
    logger.error(`Failed to send email: ${error}`)
  }
}
