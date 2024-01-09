import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import nodemailer from 'nodemailer'
import type { MailConfig } from '../storage/model'
import { getCacheConfig } from '../storage/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

// For verification mail
export async function sendVerifyMail(toMail: string, verifyUrl: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `Verify your email to create your ${config.siteConfig.siteTitle} account`, mailHtml, config.mailConfig)
}

// For subscription mail. When subscription is activated
export async function sendSubscriptionMail(toMail: string, userName: string, roleName: string, tranAmount: string, tranID: string, activeDate: string, remark: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.subscriptionEnd.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${USER_EMAIL}/g, toMail)
  mailHtml = mailHtml.replace(/\${USER_NAME}/g, userName)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_NAME}/g, roleName)
  mailHtml = mailHtml.replace(/\${TRANSACTION_AMOUNT}/g, tranAmount)
  mailHtml = mailHtml.replace(/\${TRANSACTION_ID}/g, tranID)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_ACTIVE_DATE}/g, activeDate)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_END_DATE}/g, remark)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  mailHtml = mailHtml.replace(/\${SITE_DOMAIN}/g, config.siteConfig.siteDomain)
  sendMail(toMail, `Your ${roleName} Subscription Has Activated!`, mailHtml, config.mailConfig)
}

// For subscription mail. When subscription is ended
export async function sendSubscriptionEndedMail(toMail: string, userName: string, roleName: string, remark: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.subscriptionEnd.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${USER_EMAIL}/g, toMail)
  mailHtml = mailHtml.replace(/\${USER_NAME}/g, userName)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_NAME}/g, roleName)
  mailHtml = mailHtml.replace(/\${SUBSCRIPTION_END_DATE}/g, remark)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  mailHtml = mailHtml.replace(/\${SITE_DOMAIN}/g, config.siteConfig.siteDomain)
  sendMail(toMail, ` Important Notice: Your ${roleName} Subscription Has Ended`, mailHtml, config.mailConfig)
}

// For admin approve mail. When registration review is enabled, this mail will be sent to the admin
export async function sendVerifyMailAdmin(toMail: string, verifyName: string, verifyUrl: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.admin.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${TO_MAIL}/g, verifyName)
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `Account Application for ${config.siteConfig.siteTitle}`, mailHtml, config.mailConfig)
}

// For reset password mail
export async function sendResetPasswordMail(toMail: string, verifyUrl: string) {
  const config = (await getCacheConfig())
  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.resetpassword.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `Reset your ${config.siteConfig.siteTitle} account password`, mailHtml, config.mailConfig)
}

// For notice mail. When registration review is enabled, this mail will be sent to the user
export async function sendNoticeMail(toMail: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.notice.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${SITE_DOMAIN}/g, config.siteConfig.siteDomain)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `Account opening verification for ${config.siteConfig.siteTitle} account`, mailHtml, config.mailConfig)
}

// For test mail
export async function sendTestMail(toMail: string, config: MailConfig) {
  return sendMail(toMail, 'Test mail', 'This is test mail', config)
}

async function sendMail(toMail: string, subject: string, html: string, config: MailConfig) {
  const mailOptions = {
    from: `AxiomAI <${config.smtpUserName}>`,
    to: toMail,
    subject,
    html,
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpTsl,
    auth: {
      user: config.smtpUserName,
      pass: config.smtpPassword,
    },
  })
  const info = await transporter.sendMail(mailOptions)
  return info.messageId
}
