import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import type { ChatGPTAPIOptions, ChatMessage, SendMessageOptions } from 'chatgpt'
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt'
import { SocksProxyAgent } from 'socks-proxy-agent'
import httpsProxyAgent from 'https-proxy-agent'
import fetch from 'node-fetch'
import type { AuditConfig } from 'src/storage/model'
import type { TextAuditService } from '../utils/textAudit'
import { textAuditServices } from '../utils/textAudit'
import { getCacheConfig, getOriginConfig } from '../storage/config'
import { sendResponse } from '../utils'
import { isNotEmptyString } from '../utils/is'
import type { ChatContext, ChatGPTUnofficialProxyAPIOptions, ModelConfig } from '../types'
import { getChatByMessageId } from '../storage/mongo'
import type { RequestOptions } from './types'

const { HttpsProxyAgent } = httpsProxyAgent

dotenv.config()

const ErrorCodeMessage: Record<string, string> = {
  401: '[OpenAI] Incorrect API key provided',
  403: '[OpenAI] Server refused to access, please try again later',
  502: '[OpenAI] Bad Gateway',
  503: '[OpenAI] Server is busy, please try again later',
  504: '[OpenAI] Gateway Time-out',
  500: '[OpenAI] Internal Server Error',
}

let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI
let auditService: TextAuditService

export async function initApi() {
  // More Info: https://github.com/transitive-bullshit/chatgpt-api

  const config = await getCacheConfig()
  if (!config.apiKey && !config.accessToken)
    throw new Error('Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable')

  if (config.apiModel === 'ChatGPTAPI') {
    const OPENAI_API_BASE_URL = config.apiBaseUrl
    const model = config.chatModel

    const options: ChatGPTAPIOptions = {
      apiKey: config.apiKey,
      completionParams: { model },
      debug: !config.apiDisableDebug,
      messageStore: undefined,
      getMessageById,
    }
    // increase max token limit if use gpt-4
    if (model.toLowerCase().includes('gpt-4')) {
      // if use 32k model
      if (model.toLowerCase().includes('32k')) {
        options.maxModelTokens = 32768
        options.maxResponseTokens = 8192
      }
      else {
        options.maxModelTokens = 8192
        options.maxResponseTokens = 2048
      }
    }

    if (isNotEmptyString(OPENAI_API_BASE_URL))
      options.apiBaseUrl = `${OPENAI_API_BASE_URL}/v1`

    await setupProxy(options)

    api = new ChatGPTAPI({ ...options })
  }
  else {
    const model = config.chatModel
    const options: ChatGPTUnofficialProxyAPIOptions = {
      accessToken: config.accessToken,
      apiReverseProxyUrl: isNotEmptyString(config.reverseProxy) ? config.reverseProxy : 'https://ai.fakeopen.com/api/conversation',
      model,
      debug: !config.apiDisableDebug,
    }

    await setupProxy(options)

    api = new ChatGPTUnofficialProxyAPI({ ...options })
  }
}

async function chatReplyProcess(options: RequestOptions) {
  const config = await getCacheConfig()
  const model = config.chatModel
  const { message, lastContext, process, temperature, top_p } = options
  const systemMessage = 'Your name is AxiomAI, a language model based on the GPT-3.5 architecture and trained by OpenAI. Follow the user instructions carefully. Respond using markdown.'

  try {
    const timeoutMs = (await getCacheConfig()).timeoutMs
    let options: SendMessageOptions = { timeoutMs }

    if (config.apiModel === 'ChatGPTAPI') {
      if (isNotEmptyString(systemMessage))
        options.systemMessage = systemMessage
      options.completionParams = { model, temperature, top_p }
    }

    if (lastContext != null) {
      if (config.apiModel === 'ChatGPTAPI')
        options.parentMessageId = lastContext.parentMessageId
      else
        options = { ...lastContext }
    }

    const response = await api.sendMessage(message, {
      ...options,
      onProgress: (partialResponse) => {
        process?.(partialResponse)
      },
    })

    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    const code = error.statusCode
    global.console.log(error)
    if (Reflect.has(ErrorCodeMessage, code))
      return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
    return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the AxiomNode console' })
  }
}

export function initAuditService(audit: AuditConfig) {
  if (!audit || !audit.options || !audit.options.apiKey || !audit.options.apiSecret)
    return
  const Service = textAuditServices[audit.provider]
  auditService = new Service(audit.options)
}

async function containsSensitiveWords(audit: AuditConfig, text: string): Promise<boolean> {
  if (audit.customizeEnabled && isNotEmptyString(audit.sensitiveWords)) {
    const textLower = text.toLowerCase()
    const notSafe = audit.sensitiveWords.split('\n').filter(d => textLower.includes(d.trim().toLowerCase())).length > 0
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
let cachedBalance: number | undefined
let cacheExpiration = 0

async function fetchBalance() {
  const now = new Date().getTime()
  if (cachedBalance && cacheExpiration > now)
    return Promise.resolve(cachedBalance.toFixed(3))

  // Calculate start date and end date
  const startDate = new Date(now - 90 * 24 * 60 * 60 * 1000)
  const endDate = new Date(now + 24 * 60 * 60 * 1000)

  const config = await getCacheConfig()
  const OPENAI_API_KEY = config.apiKey
  const OPENAI_API_BASE_URL = config.apiBaseUrl

  if (!isNotEmptyString(OPENAI_API_KEY))
    return Promise.resolve('-')

  const API_BASE_URL = isNotEmptyString(OPENAI_API_BASE_URL)
    ? OPENAI_API_BASE_URL
    : 'https://api.openai.com'

  // Check if you are subscribed
  const urlSubscription = `${API_BASE_URL}/v1/dashboard/billing/subscription`
  // Check General Billing
  // const urlBalance = `${API_BASE_URL}/dashboard/billing/credit_grants`
  // Check usage
  const urlUsage = `${API_BASE_URL}/v1/dashboard/billing/usage?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`

  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  }
  let socksAgent
  let httpsAgent
  if (isNotEmptyString(config.socksProxy)) {
    socksAgent = new SocksProxyAgent({
      hostname: config.socksProxy.split(':')[0],
      port: parseInt(config.socksProxy.split(':')[1]),
      userId: isNotEmptyString(config.socksAuth) ? config.socksAuth.split(':')[0] : undefined,
      password: isNotEmptyString(config.socksAuth) ? config.socksAuth.split(':')[1] : undefined,
    })
  }
  else if (isNotEmptyString(config.httpsProxy)) {
    httpsAgent = new HttpsProxyAgent(config.httpsProxy)
  }

  try {
    // Get API limits
    let response = await fetch(urlSubscription, { agent: socksAgent === undefined ? httpsAgent : socksAgent, headers })
    if (!response.ok) {
      console.error('Your account has been blocked, please login to OpenAI to view it.')
      return
    }
    const subscriptionData = await response.json()
    const totalAmount = subscriptionData.hard_limit_usd

    // Get the amount used
    response = await fetch(urlUsage, { agent: socksAgent === undefined ? httpsAgent : socksAgent, headers })
    const usageData = await response.json()
    const totalUsage = usageData.total_usage / 100

    // Calculate the remaining amount
    cachedBalance = totalAmount - totalUsage
    cacheExpiration = now + 60 * 60 * 1000

    return Promise.resolve(cachedBalance.toFixed(3))
  }
  catch (error) {
    global.console.error(error)
    return Promise.resolve('-')
  }
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

async function chatConfig() {
  const config = await getOriginConfig() as ModelConfig
  config.balance = await fetchBalance()
  return sendResponse<ModelConfig>({
    type: 'Success',
    data: config,
  })
}

async function setupProxy(options: ChatGPTAPIOptions | ChatGPTUnofficialProxyAPIOptions) {
  const config = await getCacheConfig()
  if (isNotEmptyString(config.socksProxy)) {
    const agent = new SocksProxyAgent({
      hostname: config.socksProxy.split(':')[0],
      port: parseInt(config.socksProxy.split(':')[1]),
      userId: isNotEmptyString(config.socksAuth) ? config.socksAuth.split(':')[0] : undefined,
      password: isNotEmptyString(config.socksAuth) ? config.socksAuth.split(':')[1] : undefined,

    })
    options.fetch = (url, options) => {
      return fetch(url, { agent, ...options })
    }
  }
  else {
    if (isNotEmptyString(config.httpsProxy)) {
      const httpsProxy = config.httpsProxy
      if (httpsProxy) {
        const agent = new HttpsProxyAgent(httpsProxy)
        options.fetch = (url, options) => {
          return fetch(url, { agent, ...options })
        }
      }
    }
  }
}

async function getMessageById(id: string): Promise<ChatMessage | undefined> {
  const isPrompt = id.startsWith('prompt_')
  const chatInfo = await getChatByMessageId(isPrompt ? id.substring(7) : id)

  if (chatInfo) {
    if (isPrompt) { // prompt
      return {
        id,
        conversationId: chatInfo.options.conversationId,
        parentMessageId: chatInfo.options.parentMessageId,
        role: 'user',
        text: chatInfo.prompt,
      }
    }
    else {
      return { // completion
        id,
        conversationId: chatInfo.options.conversationId,
        parentMessageId: `prompt_${id}`, // parent message is the prompt
        role: 'assistant',
        text: chatInfo.response,
      }
    }
  }
  else { return undefined }
}

initApi()

export type { ChatContext, ChatMessage }

export { chatReplyProcess, chatConfig, containsSensitiveWords }
