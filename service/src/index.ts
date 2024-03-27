import express from 'express'
import history from 'connect-history-api-fallback'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { ObjectId } from 'mongodb'
import { textTokens } from 'gpt-token'
import speakeasy from 'speakeasy'
import requestIp from 'request-ip'
import logger from './logger/winston'
import morganLogger from './logger/morgan'
import { getAzureSubscriptionKey } from './middleware/speechToken'
import { TwoFAConfig } from './types'
import type { AuthJwtPayload, RequestProps } from './types'
import type { ChatMessage } from './conversation-core'
import { abortChatProcess, chatConfig, chatReplyProcess, containsSensitiveWords, initAuditService } from './conversation-core'
import { auth, getUserId } from './middleware/auth'
import { clearApiKeyCache, clearConfigCache, getApiKeys, getCacheApiKeys, getCacheConfig, getOriginConfig } from './storage/config'
import type { AnnouncementConfig, AuditConfig, ChatInfo, ChatOptions, Config, FeaturesConfig, KeyConfig, MailConfig, MerchConfig, SiteConfig, SubscriptionConfig, UserConfig, UserInfo } from './storage/model'
import { AdvancedConfig, Status, UsageResponse, UserRole } from './storage/model'
import { authErrorType, authInfoType } from './storage/authEnum'
import {
  clearChat,
  createChatRoom,
  createUser,
  deleteAllChatRooms,
  deleteChat,
  deleteChatRoom,
  disableUser2FA,
  existsChatRoom,
  getChat,
  getChatRoom,
  getChatRooms,
  getChats,
  getDashboardData,
  getUser,
  getUserById,
  getUserStatisticsByDay,
  getUsers,
  insertChat,
  insertChatUsage,
  renameChatRoom,
  updateApiKeyStatus,
  updateChat,
  updateConfig,
  updateRoomChatModel,
  updateRoomPrompt,
  updateRoomUsingContext,
  updateUser,
  updateUser2FA,
  updateUserAdvancedConfig,
  updateUserChatModel,
  updateUserInfo,
  updateUserPassword,
  updateUserPasswordWithVerifyOld,
  updateUserStatus,
  upsertKey,
  verifyUser,
} from './storage/storage'
import { authLimiter, limiter } from './middleware/limiter'
import { hasAnyRole, isEmail, isNotEmptyString } from './utils/is'
import { sendNoticeMail, sendResetPasswordMail, sendTestMail, sendVerifyMail, sendVerifyMailAdmin } from './utils/mail'
import { checkUserResetPassword, checkUserVerify, checkUserVerifyAdmin, getUserResetPasswordUrl, getUserVerifyUrl, getUserVerifyUrlAdmin, md5 } from './utils/security'
import { isAdmin, rootAuth } from './middleware/rootAuth'
import './middleware/updateRole'
import { isAllowed } from './middleware/userRateLimit'
import redis from './storage/redis'

dotenv.config()

const app = express()
const router = express.Router()

app.use(express.json())
app.enable('trust proxy')
app.use(morganLogger) // Morgan logger for all requests

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

// Logging middleware for all responses
app.use((req, res, next) => {
  const startTime = Date.now() // Start startTime calculation at the beginning of the request
  const clientIp = requestIp.getClientIp(req)
  res.on('finish', () => {
    const duration = Date.now() - startTime // Calculate duration of the request from startTime
    const durationStr = (`${duration} ms`).padStart(8)
    const clientIpStr = clientIp.padEnd(15)
    logger.http(`${res.statusCode} | ${durationStr} | ${clientIpStr} | ${req.method} ${req.path}`)
  })
  next()
})

router.get('/chatrooms', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const rooms = await getChatRooms(userId)
    const result = []
    rooms.forEach((r) => {
      result.push({
        uuid: r.roomId,
        title: r.title,
        isEdit: false,
        prompt: r.prompt,
        usingContext: r.usingContext === undefined ? true : r.usingContext,
        chatModel: r.chatModel,
      })
    })
    res.send({ status: 'Success', message: null, data: result })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Load error', data: [] })
  }
})

router.post('/room-create', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const { title, roomId, chatModel } = req.body as { title: string; roomId: number; chatModel: string }
    const room = await createChatRoom(userId, title, roomId, chatModel)
    res.send({ status: 'Success', message: null, data: room })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Create error', data: null })
  }
})

router.post('/room-rename', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const { title, roomId } = req.body as { title: string; roomId: number }
    const success = await renameChatRoom(userId, title, roomId)
    if (success)
      res.send({ status: 'Success', message: null, data: null })
    else
      res.send({ status: 'Fail', message: 'Saved Failed', data: null })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Rename error', data: null })
  }
})

router.post('/room-prompt', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const { prompt, roomId } = req.body as { prompt: string; roomId: number }
    const success = await updateRoomPrompt(userId, roomId, prompt)
    if (success)
      res.send({ status: 'Success', message: 'Saved successfully', data: null })
    else
      res.send({ status: 'Fail', message: 'Saved Failed', data: null })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Rename error', data: null })
  }
})

router.post('/room-chatmodel', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const { chatModel, roomId } = req.body as { chatModel: string; roomId: number }
    const success = await updateRoomChatModel(userId, roomId, chatModel)
    if (success)
      res.send({ status: 'Success', message: 'Saved successfully', data: null })
    else
      res.send({ status: 'Fail', message: 'Saved Failed', data: null })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Rename error', data: null })
  }
})

router.post('/room-context', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const { using, roomId } = req.body as { using: boolean; roomId: number }
    const success = await updateRoomUsingContext(userId, roomId, using)
    if (success)
      res.send({ status: 'Success', message: 'Saved successfully', data: null })
    else
      res.send({ status: 'Fail', message: 'Saved Failed', data: null })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Rename error', data: null })
  }
})

router.post('/room-delete', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const { roomId } = req.body as { roomId: number }
    if (!roomId || !await existsChatRoom(userId, roomId)) {
      res.send({ status: 'Fail', message: 'Unknown room', data: null })
      return
    }
    const success = await deleteChatRoom(userId, roomId)
    if (success)
      res.send({ status: 'Success', message: null, data: null })
    else
      res.send({ status: 'Fail', message: 'Saved Failed', data: null })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Delete error', data: null })
  }
})

router.get('/chat-history', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const roomId = +req.query.roomId
    const lastId = req.query.lastId as string
    if (!roomId || !await existsChatRoom(userId, roomId)) {
      res.send({ status: 'Success', message: null, data: [] })
      return
    }
    const chats = await getChats(roomId, !isNotEmptyString(lastId) ? null : Number.parseInt(lastId))

    const result = []
    chats.forEach((c) => {
      if (c.status !== Status.InversionDeleted) {
        result.push({
          uuid: c.uuid,
          dateTime: new Date(c.dateTime).toLocaleString(),
          text: c.prompt,
          inversion: true,
          error: false,
          conversationOptions: null,
          requestOptions: {
            prompt: c.prompt,
            options: null,
          },
        })
      }
      if (c.status !== Status.ResponseDeleted) {
        const usage = c.options.completion_tokens
          ? {
              completion_tokens: c.options.completion_tokens || null,
              prompt_tokens: c.options.prompt_tokens || null,
              total_tokens: c.options.total_tokens || null,
              estimated: c.options.estimated || null,
            }
          : undefined
        result.push({
          uuid: c.uuid,
          dateTime: new Date(c.dateTime).toLocaleString(),
          text: c.response,
          inversion: false,
          error: false,
          loading: false,
          responseCount: (c.previousResponse?.length ?? 0) + 1,
          conversationOptions: {
            parentMessageId: c.options.messageId,
            conversationId: c.options.conversationId,
          },
          requestOptions: {
            prompt: c.prompt,
            parentMessageId: c.options.parentMessageId,
            options: {
              parentMessageId: c.options.messageId,
              conversationId: c.options.conversationId,
            },
          },
          usage,
        })
      }
    })

    res.send({ status: 'Success', message: null, data: result })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Load error', data: null })
  }
})

router.get('/chat-response-history', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const roomId = +req.query.roomId
    const uuid = +req.query.uuid
    const index = +req.query.index
    if (!roomId || !await existsChatRoom(userId, roomId)) {
      res.send({ status: 'Success', message: null, data: [] })
      return
    }
    const chat = await getChat(roomId, uuid)
    if (chat.previousResponse === undefined || chat.previousResponse.length < index) {
      res.send({ status: 'Fail', message: 'Error', data: [] })
      return
    }
    const response = index >= chat.previousResponse.length
      ? chat
      : chat.previousResponse[index]
    const usage = response.options.completion_tokens
      ? {
          completion_tokens: response.options.completion_tokens || null,
          prompt_tokens: response.options.prompt_tokens || null,
          total_tokens: response.options.total_tokens || null,
          estimated: response.options.estimated || null,
        }
      : undefined
    res.send({
      status: 'Success',
      message: null,
      data: {
        uuid: chat.uuid,
        dateTime: new Date(chat.dateTime).toLocaleString(),
        text: response.response,
        inversion: false,
        error: false,
        loading: false,
        responseCount: (chat.previousResponse?.length ?? 0) + 1,
        conversationOptions: {
          parentMessageId: response.options.messageId,
          conversationId: response.options.conversationId,
        },
        requestOptions: {
          prompt: chat.prompt,
          parentMessageId: response.options.parentMessageId,
          options: {
            parentMessageId: response.options.messageId,
            conversationId: response.options.conversationId,
          },
        },
        usage,
      },
    })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Load error', data: null })
  }
})

router.post('/chat-delete', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const { roomId, uuid, inversion } = req.body as { roomId: number; uuid: number; inversion: boolean }
    if (!roomId || !await existsChatRoom(userId, roomId)) {
      res.send({ status: 'Fail', message: 'Unknown room', data: null })
      return
    }
    await deleteChat(roomId, uuid, inversion)
    res.send({ status: 'Success', message: null, data: null })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Delete error', data: null })
  }
})

router.post('/chat-clear-all', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    await deleteAllChatRooms(userId)
    res.send({ status: 'Success', message: null, data: null })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Delete error', data: null })
  }
})

router.post('/chat-clear', auth, async (req, res) => {
  try {
    const userId = req.headers.userId as string
    const { roomId } = req.body as { roomId: number }
    if (!roomId || !await existsChatRoom(userId, roomId)) {
      res.send({ status: 'Fail', message: 'Unknown room', data: null })
      return
    }
    await clearChat(roomId)
    res.send({ status: 'Success', message: null, data: null })
  }
  catch (error) {
    console.error(error)
    res.send({ status: 'Fail', message: 'Delete error', data: null })
  }
})

const mainSystemMessage = 'You are AxiomAI, a large language model fine-tuned by Miraz Hossain'
const mainSystemMessage2 = 'You are AxiomAI, a large language model fine-tuned by Miraz Hossain. Reply in bangla language'
const promptSystemMessage = 'You are AxiomAI'
const promptSystemMessage2 = 'You are AxiomAI. Reply in bangla language'

router.post('/conversation', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  let { roomId, uuid, regenerate, prompt, options = {}, systemMessage, persona, language } = req.body as RequestProps

  if (!systemMessage && language === 'en-US')
    systemMessage = mainSystemMessage
  else if (!systemMessage && language === 'bn-BD')
    systemMessage = mainSystemMessage2

  const personaLookup = {
    precise: { temperature: 0.2, top_p: 0.5 },
    balanced: { temperature: 0.7, top_p: 0.8 },
    creative: { temperature: 1.0, top_p: 1.0 },
  }
  const { temperature, top_p } = personaLookup[persona] || personaLookup.balanced

  const userId = req.headers.userId as string
  const room = await getChatRoom(userId, roomId)
  if (room == null)
    globalThis.console.error(`Unable to get chat room \t ${userId}\t ${roomId}`)
  if (room != null && isNotEmptyString(room.prompt) && language === 'en-US')
    systemMessage = `${promptSystemMessage}. ${room.prompt}`
  if (room != null && isNotEmptyString(room.prompt) && language === 'bn-BD')
    systemMessage = `${promptSystemMessage2}. ${room.prompt}`
  let lastResponse
  let result
  let message: ChatInfo
  try {
    const config = await getCacheConfig()
    const userId = req.headers.userId.toString()
    const user = await getUserById(userId)
    // Check if the user is allowed to use the service. Applies to all users except Free users
    const { allowed, resetTime } = await isAllowed(userId)
    if (!user.roles.includes(UserRole.Free) && !allowed) {
      const message = `You've reached the current usages cap for ${UserRole[user.roles[0]]} subscription. Please try again after **${resetTime}**.`
      res.send({ status: 'Fail', message, data: null })
      return
    }

    if (config.auditConfig.enabled || config.auditConfig.customizeEnabled) {
      if (!user.roles.includes(UserRole.Admin) && await containsSensitiveWords(config.auditConfig, prompt)) {
        res.send({ status: 'Fail', message: '**❌ Contains sensitive words.**', data: null })
        logger.warn(`Contains sensitive words: ${prompt}, From User: ${userId}, From IP: ${req.ip}`)
        return
      }
    }

    message = regenerate
      ? await getChat(roomId, uuid)
      : await insertChat(uuid, prompt, roomId, options as ChatOptions)
    let firstChunk = true
    result = await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        lastResponse = chat
        const chuck = {
          id: chat.id,
          conversationId: chat.conversationId,
          text: chat.text,
          detail: {
            choices: [
              {
                finish_reason: undefined,
              },
            ],
          },
        }
        if (chat.detail && chat.detail.choices.length > 0)
          chuck.detail.choices[0].finish_reason = chat.detail.choices[0].finish_reason

        res.write(firstChunk ? JSON.stringify(chuck) : `\n${JSON.stringify(chuck)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
      user,
      messageId: message._id.toString(),
      tryCount: 0,
      room,
    })
    // return the whole response including usage
    if (!result.data.detail?.usage) {
      if (!result.data.detail)
        result.data.detail = {}
      result.data.detail.usage = new UsageResponse()
      // Because the token itself is not calculated, so the default count here is a pseudo-statistic of gpt 3.5
      result.data.detail.usage.prompt_tokens = textTokens(prompt, 'gpt-3.5-turbo')
      result.data.detail.usage.completion_tokens = textTokens(result.data.text, 'gpt-3.5-turbo')
      result.data.detail.usage.total_tokens = result.data.detail.usage.prompt_tokens + result.data.detail.usage.completion_tokens
      result.data.detail.usage.estimated = true
    }
    res.write(`\n${JSON.stringify(result.data)}`)
  }
  catch (error) {
    res.write(JSON.stringify({ message: error?.message }))
  }
  finally {
    res.end()
    try {
      if (result == null || result === undefined || result.status !== 'Success') {
        if (result && result.status !== 'Success')
          lastResponse = { text: result.message }
        result = { data: lastResponse }
      }

      if (result.data === undefined)
        // eslint-disable-next-line no-unsafe-finally
        return

      if (regenerate && message.options.messageId) {
        const previousResponse = message.previousResponse || []
        previousResponse.push({ response: message.response, options: message.options })
        await updateChat(message._id as unknown as string,
          result.data.text,
          result.data.id,
          result.data.conversationId,
          result.data.detail?.usage as UsageResponse,
          previousResponse as [])
      }
      else {
        await updateChat(message._id as unknown as string,
          result.data.text,
          result.data.id,
          result.data.conversationId,
          result.data.detail?.usage as UsageResponse)
      }

      if (result.data.detail?.usage) {
        await insertChatUsage(new ObjectId(req.headers.userId),
          roomId,
          message._id,
          result.data.id,
          result.data.detail?.usage as UsageResponse)
      }
    }
    catch (error) {
      globalThis.console.error(error)
    }
  }
})

router.post('/chat-abort', [auth, limiter], async (req, res) => {
  try {
    const userId = req.headers.userId.toString()
    const { text, messageId, conversationId } = req.body as { text: string; messageId: string; conversationId: string }
    const msgId = await abortChatProcess(userId)
    await updateChat(msgId,
      text,
      messageId,
      conversationId,
      null)
    res.send({ status: 'Success', message: 'OK', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: 'Reset email has been sent', data: null })
  }
})

router.post('/user-register', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string }
    const config = await getCacheConfig()
    if (!config.siteConfig.registerEnabled) {
      res.send({ status: 'Fail', message: 'Registration is disabled!', data: null })
      return
    }
    if (!isEmail(username)) {
      res.send({ status: 'Fail', message: 'Please enter a valid email address! Note: Repeated attempts to enter multiple spam email addresses may result in a permanent ban for your geolocation.', data: null })
      logger.warn(`Suspicious email address detected: ${username}, From IP: ${req.ip}`)
      return
    }
    if (isNotEmptyString(config.siteConfig.registerMails)) {
      let allowSuffix = false
      const emailSuffixs = config.siteConfig.registerMails.split(',')
      for (let index = 0; index < emailSuffixs.length; index++) {
        const element = emailSuffixs[index]
        allowSuffix = username.toLowerCase().endsWith(element)
        if (allowSuffix)
          break
      }
      if (!allowSuffix) {
        res.send({ status: 'Fail', message: 'This email address is not allowed', data: null })
        logger.warn(`Invalid email domain: ${username}, From IP: ${req.ip}`)
        return
      }
    }

    const user = await getUser(username)
    if (user != null) {
      if (user.status === Status.Unverified) {
        await sendVerifyMail(username, await getUserVerifyUrl(username))
        res.send({ status: 'Success', message: authInfoType.UNVERIFIED2, data: null })
        logger.info(`Resended verification email to: ${username}, From IP: ${req.ip}`)
        return
      }
      if (user.status === Status.AdminVerify) {
        res.send({ status: 'Fail', errorCode: authErrorType.PERMISSION, data: null })
        logger.warn(`Permission needed & user trying to register: ${username}, From IP: ${req.ip}`)
        return
      }
      if (user.status === Status.Banned) {
        res.send({ status: 'Fail', errorCode: authErrorType.BANNED, data: null })
        logger.warn(`Banned user trying to register: ${username}, From IP: ${req.ip}`)
        return
      }
      res.send({ status: 'Fail', message: 'The email address given has already been registered within our system!', data: null })
      logger.warn(`Duplicate email trying to register: ${username}, From IP: ${req.ip}`)
      return
    }
    const newPassword = md5(password)
    const isRoot = username.toLowerCase() === process.env.ROOT_USER
    await createUser(username, newPassword, isRoot ? [UserRole.Admin] : [UserRole.Free])

    if (isRoot) {
      res.send({ status: 'Success', message: authInfoType.AASV, data: null })
      logger.info(`Registered new root user: ${username}, From IP: ${req.ip}`)
    }
    else {
      await sendVerifyMail(username, await getUserVerifyUrl(username))
      res.send({ status: 'Success', message: authInfoType.UNVERIFIED, data: null })
      logger.info(`Registered new email: ${username}, From IP: ${req.ip}`)
    }
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
    logger.error(`Register route error: ${error.message}, From IP: ${req.ip}`)
  }
})

router.post('/oauth3', rootAuth, async (req, res) => {
  try {
    const userId = req.headers.userId.toString()

    if (!isAdmin(userId))
      throw new Error('⚠️ No permission')
    logger.warn(`Suspicious activity detected. Unauthorized access to oauth3 (rootAuth): ${userId}, From IP: ${req.ip}`)

    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const config = await getCacheConfig()
    const hasAuth = config.siteConfig.loginEnabled || config.siteConfig.authProxyEnabled
    const authProxyEnabled = config.siteConfig.authProxyEnabled
    const allowRegister = config.siteConfig.registerEnabled
    if (config.apiModel !== 'ChatGPTAPI' && config.apiModel !== 'ChatGPTUnofficialProxyAPI')
      config.apiModel = 'ChatGPTAPI'
    const userId = await getUserId(req)
    const chatModels: {
      label
      key: string
      value: string
    }[] = []

    const chatModelOptions = config.siteConfig.chatModels.split(',').map((model: string) => {
      let label = model
      if (model === 'llama-2-7b-chat')
        label = 'llama-2-7b'
      else if (model === 'llama-2-13b-chat')
        label = 'llama-2-13b'
      else if (model === 'llava-13b')
        label = 'LLaVA: vision'
      return {
        label,
        key: model,
        value: model,
      }
    })

    let userInfo: { email: string; name: string; description: string; avatar: string; userId: string; root: boolean; roles: UserRole[]; config: UserConfig; advanced: AdvancedConfig }
    if (userId != null) {
      const user = await getUserById(userId)
      if (user === null) {
        globalThis.console.error(`session userId ${userId} but query user is null.`)
        res.send({
          status: 'Success',
          message: '',
          data: {
            auth: hasAuth,
            authProxyEnabled,
            allowRegister,
            model: config.apiModel,
            title: config.siteConfig.siteTitle,
            chatModels,
            allChatModels: chatModelOptions,
          },
        })
        return
      }

      userInfo = {
        email: user.email,
        name: user.name,
        description: user.description,
        avatar: user.avatar,
        userId: user._id.toString(),
        root: user.roles.includes(UserRole.Admin),
        roles: user.roles,
        config: user.config,
        advanced: user.advanced,
      }
      const keys = (await getCacheApiKeys()).filter(d => hasAnyRole(d.userRoles, user.roles))

      const count: { key: string; count: number }[] = []
      chatModelOptions.forEach((chatModel) => {
        keys.forEach((key) => {
          if (key.chatModels.includes(chatModel.value)) {
            if (count.filter(d => d.key === chatModel.value).length <= 0) {
              count.push({ key: chatModel.value, count: 1 })
            }
            else {
              const thisCount = count.filter(d => d.key === chatModel.value)[0]
              thisCount.count++
            }
          }
        })
      })
      count.forEach((c) => {
        const thisChatModel = chatModelOptions.filter(d => d.value === c.key)[0]
        const suffix = c.count > 1 ? ` (${c.count})` : ''
        chatModels.push({
          label: `${thisChatModel.label}${suffix}`,
          key: c.key,
          value: c.key,
        })
      })
    }

    res.send({
      status: 'Success',
      message: '',
      data: {
        auth: hasAuth,
        authProxyEnabled,
        allowRegister,
        model: config.apiModel,
        title: config.siteConfig.siteTitle,
        chatModels,
        allChatModels: chatModelOptions,
        userInfo,
      },
    })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-login', authLimiter, async (req, res) => {
  try {
    const { username, password, token } = req.body as { username: string; password: string; token?: string }

    if (!username || !isEmail(username))
      throw new Error('Please enter a correctly formatted email address')
    if (!username || !password)
      throw new Error('Username or password is empty')
    const user = await getUser(username)
    if (user == null || user.password !== md5(password))
      throw new Error('User does not exist or incorrect password')
    if (user.status === Status.Unverified) {
      res.send({ status: 'Fail', errorCode: authErrorType.UNVERIFIED, data: null })
      return
    }
    if (user != null && user.status === Status.AdminVerify) {
      res.send({ status: 'Fail', errorCode: authErrorType.PERMISSION, data: null })
      return
    }
    if (user.status === Status.Disabled) {
      res.send({ status: 'Fail', errorCode: authErrorType.ABNORMAL, data: null })
      return
    }
    if (user.status === Status.Banned) {
      res.send({ status: 'Fail', errorCode: authErrorType.BANNED, data: null })
      return
    }
    if (user.secretKey) {
      if (token) {
        const verified = speakeasy.totp.verify({
          secret: user.secretKey,
          encoding: 'base32',
          token,
        })
        if (!verified)
          throw new Error('Your passcode doesn\'t match our records. Please try again.')
      }
      else {
        res.send({ status: 'Success', message: 'Two-step verification required', data: { need2FA: true } })
        return
      }
    }

    const config = await getCacheConfig()
    const jwtToken = jwt.sign({
      name: user.name ? user.name : user.email,
      avatar: user.avatar,
      description: user.description ? user.description : 'Innovative and strategic problem solver.',
      userId: user._id.toString(),
      root: user.roles.includes(UserRole.Admin),
      config: user.config,
    } as AuthJwtPayload, config.siteConfig.loginSalt.trim())
    res.send({ status: 'Success', message: 'Login successful, welcome back.', data: { token: jwtToken } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-logout', async (req, res) => {
  res.send({ status: 'Success', message: 'Logout successful', data: null })
})

router.post('/user-send-reset-mail', authLimiter, async (req, res) => {
  try {
    const { username } = req.body as { username: string }

    if (!username || !isEmail(username))
      throw new Error('Please enter a correctly formatted email address')
    const user = await getUser(username)
    if (user == null) {
      res.send({ status: 'Fail', errorCode: authErrorType.NOTFOUND, data: null })
      return
    }
    if (user.status === Status.Unverified) {
      res.send({ status: 'Fail', errorCode: authErrorType.UNVERIFIED, data: null })
      return
    }
    if (user.status === Status.Disabled) {
      res.send({ status: 'Fail', errorCode: authErrorType.ABNORMAL, data: null })
      return
    }
    if (user.status === Status.Banned) {
      res.send({ status: 'Fail', errorCode: authErrorType.BANNED, data: null })
      return
    }
    if (user.status === Status.AdminVerify) {
      res.send({ status: 'Fail', errorCode: authErrorType.PERMISSION, data: null })
      return
    }

    await sendResetPasswordMail(username, await getUserResetPasswordUrl(username))
    res.send({ status: 'Success', message: authInfoType.SRPM, data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-reset-password', authLimiter, async (req, res) => {
  try {
    const { username, password, sign } = req.body as { username: string; password: string; sign: string }
    if (!username || !password || !isEmail(username))
      throw new Error('Username or password is empty')
    if (!sign || checkUserResetPassword(sign, username) === 'expired')
      throw new Error('The link is invalid, please resend.')
    const user = await getUser(username)
    if (user == null || user.status !== Status.Normal) {
      res.send({ status: 'Fail', errorCode: authErrorType.ABNORMAL2, data: null })
      return
    }

    updateUserPassword(user._id.toString(), md5(password))

    res.send({ status: 'Success', message: authInfoType.PRSC, data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-info', auth, async (req, res) => {
  try {
    const { email, name, avatar, description } = req.body as UserInfo
    const userId = req.headers.userId.toString()

    const user = await getUserById(userId)
    if (user == null || user.status !== Status.Normal)
      throw new Error('User does not exist.')
    await updateUserInfo(userId, { email, name, avatar, description } as UserInfo)
    res.send({ status: 'Success', message: 'Update successful' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-chat-model', auth, async (req, res) => {
  try {
    const { chatModel } = req.body as { chatModel: string }
    const userId = req.headers.userId.toString()

    const user = await getUserById(userId)
    if (user == null || user.status !== Status.Normal)
      throw new Error('User does not exist.')
    await updateUserChatModel(userId, chatModel)
    res.send({ status: 'Success', message: 'Update successfully' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.get('/setting-dashboard', rootAuth, async (req, res) => {
  try {
    const data = await getDashboardData()
    res.status(200).json({ status: 'Success', message: 'Get successfully', data })
  }
  catch (error) {
    res.status(500).json({ status: 'Fail', message: error.message, data: null })
  }
})

router.get('/users', rootAuth, async (req, res) => {
  try {
    const page = +req.query.page
    const size = +req.query.size
    const searchQuery = req.query.search as string || '' // Retrieve search query from request query parameters
    const data = await getUsers(page, size, searchQuery)
    res.status(200).json({ status: 'Success', message: 'Get successfully', data })
  }
  catch (error) {
    res.status(500).json({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-status', rootAuth, async (req, res) => {
  try {
    const { userId, status } = req.body as { userId: string; status: Status }
    const user = await getUserById(userId)
    await updateUserStatus(userId, status)
    if ((user.status === Status.Unverified || user.status === Status.AdminVerify) && status === Status.Normal)
      await sendNoticeMail(user.email)
    res.send({ status: 'Success', message: 'Update successfully [STATUS]' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-edit', rootAuth, async (req, res) => {
  try {
    const { userId, email, password, roles, remark, message } = req.body as { userId?: string; email: string; password: string; roles: UserRole[]; remark?: string; message?: string }
    if (userId) {
      await updateUser(userId, roles, password, remark, message)
    }
    else {
      const newPassword = md5(password)
      const user = await createUser(email, newPassword, roles, null, remark)
      await updateUserStatus(user._id.toString(), Status.Normal)
    }
    res.send({ status: 'Success', message: 'Update successfully [EDIT]' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-password', auth, async (req, res) => {
  try {
    let { oldPassword, newPassword, confirmPassword } = req.body as { oldPassword: string; newPassword: string; confirmPassword: string }
    if (!oldPassword || !newPassword || !confirmPassword)
      throw new Error('Password cannot be empty')
    if (newPassword !== confirmPassword)
      throw new Error('The two passwords are inconsistent')
    if (newPassword === oldPassword)
      throw new Error('The new password cannot be the same as the old password')
    if (newPassword.length < 8)
      throw new Error('The password length cannot be less than 8 digits')

    const userId = req.headers.userId.toString()
    oldPassword = md5(oldPassword)
    newPassword = md5(newPassword)
    const result = await updateUserPasswordWithVerifyOld(userId, oldPassword, newPassword)
    if (result.matchedCount <= 0)
      throw new Error('Old password error')
    if (result.modifiedCount <= 0)
      throw new Error('Update error')
    res.send({ status: 'Success', message: ' Update successfully' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.get('/user-2fa', auth, async (req, res) => {
  try {
    const userId = req.headers.userId.toString()
    const user = await getUserById(userId)

    const data = new TwoFAConfig()
    if (user.secretKey) {
      data.enabled = true
    }
    else {
      const secret = speakeasy.generateSecret({ length: 20, name: `CHATGPT-WEB:${user.email}` })
      data.otpauthUrl = secret.otpauth_url
      data.enabled = false
      data.secretKey = secret.base32
      data.userName = user.email
    }
    res.send({ status: 'Success', message: 'Get successfully', data })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-2fa', auth, async (req, res) => {
  try {
    const { secretKey, token } = req.body as { secretKey: string; token: string }
    const userId = req.headers.userId.toString()

    const verified = speakeasy.totp.verify({
      secret: secretKey,
      encoding: 'base32',
      token,
    })
    if (!verified)
      throw new Error('Verification failed')
    await updateUser2FA(userId, secretKey)
    res.send({ status: 'Success', message: 'Enable 2FA successfully' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-disable-2fa', auth, async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    const userId = req.headers.userId.toString()
    const user = await getUserById(userId)
    if (!user || !user.secretKey)
      throw new Error('2FA not enabled')
    const verified = speakeasy.totp.verify({
      secret: user.secretKey,
      encoding: 'base32',
      token,
    })
    if (!verified)
      throw new Error('Verification failed')
    await disableUser2FA(userId)
    res.send({ status: 'Success', message: 'Disable 2FA successfully' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user-disable-2fa-admin', rootAuth, async (req, res) => {
  try {
    const { userId } = req.body as { userId: string }
    await disableUser2FA(userId)
    res.send({ status: 'Success', message: 'Disable 2FA successfully' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verification', authLimiter, async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')
    const username = await checkUserVerify(token)
    if (username === 'expired')
      throw new Error('The link is invalid, please resend.')
    const user = await getUser(username)
    if (user == null)
      throw new Error('The email not exists')
    if (user.status === Status.Deleted) {
      res.send({ status: 'Success', message: authErrorType.USDV, data: null })
      return
    }
    if (user.status === Status.Normal)
      throw new Error('The email address given has already been registered within our system!')
    if (user.status === Status.AdminVerify) {
      res.send({ status: 'Success', message: authInfoType.PERMISSION2, data: null })
      return
    }
    if (user.status === Status.Banned) {
      res.send({ status: 'Success', message: authErrorType.BANNED, data: null })
      return
    }
    if (user.status !== Status.Unverified) {
      res.send({ status: 'Success', message: authErrorType.ABNORMAL2, data: null })
      return
    }

    const config = await getCacheConfig()
    let message = authInfoType.VERIFIED
    if (config.siteConfig.registerReview) {
      await verifyUser(username, Status.AdminVerify)
      await sendVerifyMailAdmin(process.env.ROOT_USER, username, await getUserVerifyUrlAdmin(username))
      message = authInfoType.PERMISSION
    }
    else {
      await verifyUser(username, Status.Normal)
    }
    res.send({ status: 'Success', message, data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/admin-verification', authLimiter, async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')
    const username = await checkUserVerifyAdmin(token)
    const user = await getUser(username)
    if (user == null)
      throw new Error('The email not exists')
    if (user.status !== Status.AdminVerify)
      throw new Error(`Account abnormality ${user.status}`)
    await verifyUser(username, Status.Normal)
    await sendNoticeMail(username)
    res.send({ status: 'Success', message: 'Account has been activated', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-system', rootAuth, async (req, res) => {
  try {
    const { apiKey, apiModel, apiBaseUrl, accessToken, timeoutMs, reverseProxy } = req.body as Config

    const thisConfig = await getOriginConfig()
    thisConfig.apiKey = apiKey
    thisConfig.apiModel = apiModel
    thisConfig.apiBaseUrl = apiBaseUrl
    thisConfig.accessToken = accessToken
    thisConfig.reverseProxy = reverseProxy
    thisConfig.timeoutMs = timeoutMs
    await updateConfig(thisConfig)
    clearConfigCache()
    const response = await chatConfig()
    res.send({ status: 'Success', message: 'Successfully', data: response.data })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-site', rootAuth, async (req, res) => {
  try {
    const config = req.body as SiteConfig

    const thisConfig = await getOriginConfig()
    thisConfig.siteConfig = config
    const result = await updateConfig(thisConfig)
    // Update the globalRateLimit in Redis
    await redis.set('globalRateLimit', JSON.stringify(result.siteConfig.rateLimit))
    clearConfigCache()
    res.send({ status: 'Success', message: 'Successfully', data: result.siteConfig })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-subscription', rootAuth, async (req, res) => {
  try {
    const config = req.body as SubscriptionConfig

    const thisConfig = await getOriginConfig()
    thisConfig.subscriptionConfig = config
    const result = await updateConfig(thisConfig)
    // Update the subscriptionConfig in Redis
    await redis.set('subscriptionConfig', JSON.stringify(result.subscriptionConfig))
    clearConfigCache()
    res.send({ status: 'Success', message: 'Successfully', data: result.subscriptionConfig })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.get('/user-subscription', auth, async (req, res) => {
  try {
    const subscriptionConfig = JSON.parse(await redis.get('subscriptionConfig'))
    res.send({ status: 'Success', message: 'Successfully fetched', data: subscriptionConfig })
  }
  catch (error) {
    res.status(500).send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-announcement', rootAuth, async (req, res) => {
  try {
    const config = req.body as AnnouncementConfig

    const thisConfig = await getOriginConfig()
    thisConfig.announcementConfig = config
    const result = await updateConfig(thisConfig)
    // Update the announcementConfig in Redis
    await redis.set('announcementConfig', JSON.stringify(result.announcementConfig))
    clearConfigCache()
    res.send({ status: 'Success', message: 'Successfully', data: result.announcementConfig })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.get('/user-announcement', auth, async (req, res) => {
  try {
    const userId = req.headers.userId.toString()
    const user = await getUserById(userId)

    const announcementConfig = JSON.parse(await redis.get('announcementConfig'))
    const userMessage = user.message
    res.send({ status: 'Success', message: 'Successfully fetched', data: { userMessage, announcementConfig } })
  }
  catch (error) {
    res.status(500).send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-merch', rootAuth, async (req, res) => {
  try {
    const config = req.body as MerchConfig

    const thisConfig = await getOriginConfig()
    thisConfig.merchConfig = config
    const result = await updateConfig(thisConfig)
    // Update the merchConfig in Redis
    await redis.set('merchConfig', JSON.stringify(result.merchConfig))
    clearConfigCache()
    res.send({ status: 'Success', message: 'Successfully', data: result.merchConfig })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.get('/user-merch', auth, async (req, res) => {
  try {
    const merchConfig = JSON.parse(await redis.get('merchConfig'))
    res.send({ status: 'Success', message: 'Successfully fetched', data: merchConfig })
  }
  catch (error) {
    res.status(500).send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-features', rootAuth, async (req, res) => {
  try {
    const config = req.body as FeaturesConfig

    const thisConfig = await getOriginConfig()
    thisConfig.featuresConfig = config
    const result = await updateConfig(thisConfig)
    // Update the featuresConfig in Redis
    await redis.set('featuresConfig', JSON.stringify(result.featuresConfig))
    clearConfigCache()
    res.send({ status: 'Success', message: 'Successfully', data: result.featuresConfig })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.get('/user-features', auth, async (req, res) => {
  try {
    const featuresConfig = JSON.parse(await redis.get('featuresConfig'))
    res.send({ status: 'Success', message: 'Successfully fetched', data: featuresConfig })
  }
  catch (error) {
    res.status(500).send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-mail', rootAuth, async (req, res) => {
  try {
    const config = req.body as MailConfig

    const thisConfig = await getOriginConfig()
    thisConfig.mailConfig = config
    const result = await updateConfig(thisConfig)
    clearConfigCache()
    res.send({ status: 'Success', message: 'Successfully', data: result.mailConfig })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/mail-test', rootAuth, async (req, res) => {
  try {
    const config = req.body as MailConfig
    const userId = req.headers.userId as string
    const user = await getUserById(userId)
    await sendTestMail(user.email, config)
    res.send({ status: 'Success', message: 'Successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-audit', rootAuth, async (req, res) => {
  try {
    const config = req.body as AuditConfig

    const thisConfig = await getOriginConfig()
    thisConfig.auditConfig = config
    const result = await updateConfig(thisConfig)
    clearConfigCache()
    if (config.enabled)
      initAuditService(config)
    res.send({ status: 'Success', message: 'Successfully', data: result.auditConfig })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/audit-test', rootAuth, async (req, res) => {
  try {
    const { audit, text } = req.body as { audit: AuditConfig; text: string }
    const config = await getCacheConfig()
    if (audit.enabled)
      initAuditService(audit)
    const result = await containsSensitiveWords(audit, text)
    if (audit.enabled)
      initAuditService(config.auditConfig)
    res.send({ status: 'Success', message: result ? 'Contains sensitive words' : 'Does not contain sensitive words', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-advanced', auth, async (req, res) => {
  try {
    const config = req.body as {
      persona: string
      memory: number
      sync: boolean
    }
    if (config.sync) {
      if (!isAdmin(req.headers.userId as string)) {
        res.send({ status: 'Fail', message: '⚠️ No permission', data: null })
        return
      }
      const thisConfig = await getOriginConfig()
      thisConfig.advancedConfig = new AdvancedConfig(
        config.persona,
        config.memory,
      )
      await updateConfig(thisConfig)
      clearConfigCache()
    }
    const userId = req.headers.userId.toString()
    await updateUserAdvancedConfig(userId, new AdvancedConfig(
      config.persona,
      config.memory,
    ))
    res.send({ status: 'Success', message: 'Successfully saved' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-reset-advanced', auth, async (req, res) => {
  try {
    const userId = req.headers.userId.toString()
    await updateUserAdvancedConfig(userId, null)
    res.send({ status: 'Success', message: 'Successfully reset!' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.get('/setting-keys', rootAuth, async (req, res) => {
  try {
    const result = await getApiKeys()
    res.send({ status: 'Success', message: null, data: result })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-key-status', rootAuth, async (req, res) => {
  try {
    const { id, status } = req.body as { id: string; status: Status }
    await updateApiKeyStatus(id, status)
    clearApiKeyCache()
    res.send({ status: 'Success', message: 'Update successfully' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/setting-key-upsert', rootAuth, async (req, res) => {
  try {
    const keyConfig = req.body as KeyConfig
    if (keyConfig._id !== undefined)
      keyConfig._id = new ObjectId(keyConfig._id)
    await upsertKey(keyConfig)
    clearApiKeyCache()
    res.send({ status: 'Success', message: 'Successfully' })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/statistics/by-day', auth, async (req, res) => {
  try {
    let { userId, start, end } = req.body as { userId?: string; start: number; end: number }
    if (!userId)
      userId = req.headers.userId as string
    else if (!isAdmin(req.headers.userId as string))
      throw new Error('⚠️ No permission')

    const data = await getUserStatisticsByDay(new ObjectId(userId as string), start, end)
    res.send({ status: 'Success', message: '', data })
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/voice', [auth, limiter], getAzureSubscriptionKey)

app.use(history())
app.use(express.static('public'))

app.use('', router)
app.use('/axiomnode', router)

app.listen(10829)
