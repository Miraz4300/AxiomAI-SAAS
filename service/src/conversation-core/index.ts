import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import type { ChatGPTAPIOptions, ChatMessage, SendMessageOptions } from 'chatgpt'
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt'
import jwt_decode from 'jwt-decode'
import type { AuditConfig, KeyConfig, UserInfo } from '../storage/model'
import { Status } from '../storage/model'
import { convertImageUrl } from '../utils/images'
import type { TextAuditService } from '../utils/textAudit'
import { textAuditServices } from '../utils/textAudit'
import { getCacheApiKeys, getCacheConfig, getOriginConfig } from '../storage/config'
import { sendResponse } from '../utils'
import { hasAnyRole, isNotEmptyString } from '../utils/is'
import type { ChatContext, ChatGPTUnofficialProxyAPIOptions, JWT, ModelConfig } from '../types'
import { getChatByMessageId, updateRoomAccountId } from '../storage/storage'
import type { RequestOptions } from './types'

dotenv.config()

const ErrorCodeMessage: Record<string, string> = {
  401: '**[AxiomAI] Incorrect API key provided**',
  403: '**[AxiomAI] Server refused to access, please try again later**',
  502: '**[AxiomAI] Bad Gateway**',
  503: '**[AxiomAI] Server is busy, please try again later**',
  504: '**[AxiomAI] Gateway Time-out**',
  500: '**[AxiomAI] Internal Server Error**',
}

let auditService: TextAuditService
const _lockedKeys: { key: string; lockedTime: number }[] = []

export async function initApi(key: KeyConfig, chatModel: string, maxContextCount: number) {
  const config = await getCacheConfig()
  const model = chatModel as string

  if (key.keyModel === 'ChatGPTAPI') {
    const OPENAI_API_BASE_URL = isNotEmptyString(key.baseUrl) ? key.baseUrl : config.apiBaseUrl

    let contextCount = 0
    const options: ChatGPTAPIOptions = {
      apiKey: key.key,
      completionParams: { model },
      debug: config.apiEnableDebug,
      messageStore: undefined,
      getMessageById: async (id) => {
        if (contextCount++ >= maxContextCount)
          return null
        return await getMessageById(id)
      },
    }

    // Set the token limits based on the model's type. This is because different models have different token limits.
    // The token limit includes the token count from both the message array sent and the model response.

    // For the gpt-3.5-turbo-1106 model.
    if (model.toLowerCase().includes('turbo-1106')) {
      options.maxModelTokens = 16385
      options.maxResponseTokens = 4096
    }
    // For the gpt-3.5-turbo-0125 model.
    else if (model.toLowerCase().includes('turbo-0125')) {
      options.maxModelTokens = 16385
      options.maxResponseTokens = 4096
    }
    // For the gpt-4 and 4-0613 models.
    else if (model.toLowerCase().includes('gpt-4')) {
      options.maxModelTokens = 8192
      options.maxResponseTokens = 2048
    }
    // For the gpt-4-1106-preview model.
    else if (model.toLowerCase().includes('1106-preview')) {
      options.maxModelTokens = 128000
      options.maxResponseTokens = 4096
    }
    // For the gpt-4-0125-preview model.
    else if (model.toLowerCase().includes('0125-preview')) {
      options.maxModelTokens = 128000
      options.maxResponseTokens = 4096
    }
    // For the gemini-pro, gemini-1.0-pro and gemini-1.0-pro-001 models.
    else if (model.toLowerCase().includes('gemini')) {
      options.maxModelTokens = 30720
      options.maxResponseTokens = 2048
    }
    else {
      options.maxModelTokens = 4096
      options.maxResponseTokens = 1024
    }

    if (isNotEmptyString(OPENAI_API_BASE_URL)) {
      // if find /v1 in OPENAI_API_BASE_URL then use it
      if (OPENAI_API_BASE_URL.includes('/v1'))
        options.apiBaseUrl = `${OPENAI_API_BASE_URL}`
      else
        options.apiBaseUrl = `${OPENAI_API_BASE_URL}/v1`
    }

    return new ChatGPTAPI({ ...options })
  }
  else {
    const options: ChatGPTUnofficialProxyAPIOptions = {
      accessToken: key.key,
      apiReverseProxyUrl: isNotEmptyString(key.baseUrl)
        ? key.baseUrl
        : isNotEmptyString(config.reverseProxy)
          ? config.reverseProxy
          : 'https://ai.fakeopen.com/api/conversation',
      model,
      debug: config.apiEnableDebug,
    }

    return new ChatGPTUnofficialProxyAPI({ ...options })
  }
}

const processThreads: { userId: string; abort: AbortController; messageId: string }[] = []

async function chatReplyProcess(options: RequestOptions) {
  const model = options.room.chatModel
  const key = await getRandomApiKey(options.user, model, options.room.accountId)
  const userId = options.user._id.toString()

  // Memory to context count map
  const memory = options.user.advanced.memory ?? 5
  const memoryToContextCountMap = { 5: 5, 50: 10, 95: 20 }
  const maxContextCount = memoryToContextCountMap[memory] || 5

  const messageId = options.messageId
  if (key == null || key === undefined)
    throw new Error('No available subscription configuration. Please try again.')

  if (key.keyModel === 'ChatGPTUnofficialProxyAPI') {
    if (!options.room.accountId)
      updateRoomAccountId(userId, options.room.roomId, getAccountId(key.key))

    if (options.lastContext && ((options.lastContext.conversationId && !options.lastContext.parentMessageId)
      || (!options.lastContext.conversationId && options.lastContext.parentMessageId)))
      throw new Error('Unable to use AccessToken and API at the same time in the same room. Please contact the administrator or open a new chat room for conversation')
  }

  const { message, uploadFileKeys, lastContext, process, systemMessage, temperature, top_p } = options

  let content: string | {
    type: string
    text?: string
    image_url?: {
      url: string
    }
  }[] = message
  if (uploadFileKeys && uploadFileKeys.length > 0) {
    content = [
      {
        type: 'text',
        text: message,
      },
    ]
    for (const uploadFileKey of uploadFileKeys) {
      content.push({
        type: 'image_url',
        image_url: {
          url: await convertImageUrl(uploadFileKey),
        },
      })
    }
  }

  try {
    const timeoutMs = (await getCacheConfig()).timeoutMs
    let options: SendMessageOptions = { timeoutMs }

    if (key.keyModel === 'ChatGPTAPI') {
      if (isNotEmptyString(systemMessage))
        options.systemMessage = systemMessage
      options.completionParams = { model, temperature, top_p }
    }

    if (lastContext != null) {
      if (key.keyModel === 'ChatGPTAPI')
        options.parentMessageId = lastContext.parentMessageId
      else
        options = { ...lastContext }
    }
    const api = await initApi(key, model, maxContextCount)

    const abort = new AbortController()
    options.abortSignal = abort.signal
    processThreads.push({ userId, abort, messageId })
    const response = await api.sendMessage(content, {
      ...options,
      onProgress: (partialResponse) => {
        process?.(partialResponse)
      },
    })

    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    const code = error.statusCode
    if (code === 429 && (error.message.includes('Too Many Requests') || error.message.includes('Rate limit'))) {
      // access token  Only one message at a time
      if (options.tryCount++ < 3) {
        _lockedKeys.push({ key: key.key, lockedTime: Date.now() })
        await new Promise(resolve => setTimeout(resolve, 2000))
        return await chatReplyProcess(options)
      }
    }
    globalThis.console.error(error)
    if (Reflect.has(ErrorCodeMessage, code))
      return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
    return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the AxiomNode console' })
  }
  finally {
    const index = processThreads.findIndex(d => d.userId === userId)
    if (index > -1)
      processThreads.splice(index, 1)
  }
}

export function abortChatProcess(userId: string) {
  const index = processThreads.findIndex(d => d.userId === userId)
  if (index <= -1)
    return
  const messageId = processThreads[index].messageId
  processThreads[index].abort.abort()
  processThreads.splice(index, 1)
  return messageId
}

export function initAuditService(audit: AuditConfig) {
  if (!audit || !audit.options || !audit.options.apiKey || !audit.options.apiSecret)
    return
  const Service = textAuditServices[audit.provider]
  auditService = new Service(audit.options)
}

async function containsSensitiveWords(audit: AuditConfig, text: string): Promise<boolean> {
  if (audit.customizeEnabled && isNotEmptyString(audit.sensitiveWords)) {
    const textLower = text.toLowerCase().split(' ')
    const notSafe = audit.sensitiveWords.split('\n').some(sensitiveWord => textLower.includes(sensitiveWord.trim().toLowerCase()))
    if (notSafe)
      return true
  }
  if (audit.enabled) {
    if (!auditService)
      initAuditService(audit)
    return await auditService.containsSensitiveWords(text)
  }
  return false
}

async function chatConfig() {
  const config = await getOriginConfig() as ModelConfig
  return sendResponse<ModelConfig>({
    type: 'Success',
    data: config,
  })
}

async function getMessageById(id: string): Promise<ChatMessage | undefined> {
  const isPrompt = id.startsWith('prompt_')
  const chatInfo = await getChatByMessageId(isPrompt ? id.substring(7) : id)

  if (chatInfo) {
    const parentMessageId = isPrompt
      ? chatInfo.options.parentMessageId
      : `prompt_${id}` // parent message is the prompt

    if (chatInfo.status !== Status.Normal) { // jumps over deleted messages
      return parentMessageId
        ? getMessageById(parentMessageId)
        : undefined
    }
    else {
      if (isPrompt) { // prompt
        let content: string | {
          type: string
          text?: string
          image_url?: {
            url: string
          }
        }[] = chatInfo.prompt
        if (chatInfo.images && chatInfo.images.length > 0) {
          content = [
            {
              type: 'text',
              text: chatInfo.prompt,
            },
          ]
          for (const image of chatInfo.images) {
            content.push({
              type: 'image_url',
              image_url: {
                url: await convertImageUrl(image),
              },
            })
          }
        }
        return {
          id,
          conversationId: chatInfo.options.conversationId,
          parentMessageId,
          role: 'user',
          text: content,
        }
      }
      else {
        return { // completion
          id,
          conversationId: chatInfo.options.conversationId,
          parentMessageId,
          role: 'assistant',
          text: chatInfo.response,
        }
      }
    }
  }
  else { return undefined }
}

async function randomKeyConfig(keys: KeyConfig[]): Promise<KeyConfig | null> {
  if (keys.length <= 0)
    return null
  // cleanup old locked keys
  _lockedKeys.filter(d => d.lockedTime <= Date.now() - 1000 * 20).forEach(d => _lockedKeys.splice(_lockedKeys.indexOf(d), 1))

  let unsedKeys = keys.filter(d => _lockedKeys.filter(l => d.key === l.key).length <= 0)
  const start = Date.now()
  while (unsedKeys.length <= 0) {
    if (Date.now() - start > 3000)
      break
    await new Promise(resolve => setTimeout(resolve, 1000))
    unsedKeys = keys.filter(d => _lockedKeys.filter(l => d.key === l.key).length <= 0)
  }
  if (unsedKeys.length <= 0)
    return null
  const thisKey = unsedKeys[Math.floor(Math.random() * unsedKeys.length)]
  return thisKey
}

async function getRandomApiKey(user: UserInfo, chatModel: string, accountId?: string): Promise<KeyConfig | undefined> {
  let keys = (await getCacheApiKeys()).filter(d => hasAnyRole(d.userRoles, user.roles))
    .filter(d => d.chatModels.includes(chatModel))
  if (accountId)
    keys = keys.filter(d => d.keyModel === 'ChatGPTUnofficialProxyAPI' && getAccountId(d.key) === accountId)

  return randomKeyConfig(keys)
}

function getAccountId(accessToken: string): string {
  try {
    const jwt = jwt_decode(accessToken) as JWT
    return jwt['https://api.openai.com/auth'].user_id
  }
  catch (error) {
    return ''
  }
}

export type { ChatContext, ChatMessage }

export { chatReplyProcess, chatConfig, containsSensitiveWords }
