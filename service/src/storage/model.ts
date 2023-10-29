import type { ObjectId } from 'mongodb'
import type { TextAuditServiceOptions, TextAuditServiceProvider } from 'src/utils/textAudit'

export enum Status {
  Normal = 0,
  Deleted = 1,
  InversionDeleted = 2,
  ResponseDeleted = 3,
  Unverified = 4,
  AdminVerify = 5,
  Disabled = 6,
}

export enum UserRole {
  Admin = 0,
  Free = 1,
  Guest = 2,
  Premium = 3,
  MVP = 4,
  Support = 5,
  Basic = 6,
  'Basic+' = 7,
  Contributor = 8,
  Developer = 9,
  Tester = 10,
  Partner = 11,
  Moderator = 12,
  Sales = 13,
}

export class UserInfo {
  _id: ObjectId
  name: string
  email: string
  password: string
  status: Status
  createTime: string
  verifyTime?: string
  avatar?: string
  description?: string
  updateTime?: string
  config?: UserConfig
  roles?: UserRole[]
  remark?: string
  constructor(email: string, password: string) {
    this.name = email
    this.email = email
    this.password = password
    this.status = Status.Unverified
    this.createTime = new Date().toLocaleString()
    this.verifyTime = null
    this.updateTime = new Date().toLocaleString()
    this.roles = [UserRole.Free]
    this.remark = null
  }
}

export class UserConfig {
  chatModel: CHATMODEL
}

// https://platform.openai.com/docs/models/overview
export type CHATMODEL = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-0613' | 'gpt-3.5-turbo-16k' | 'gpt-3.5-turbo-16k-0613' | 'gpt-4' | 'gpt-4-0613' | 'gpt-4-32k' | 'gpt-4-32k-0613' | 'text-davinci-002-render-sha-mobile' | 'text-embedding-ada-002' | 'gpt-4-mobile' | 'gpt-4-browsing'

export const CHATMODELS: CHATMODEL[] = [
  'gpt-3.5-turbo', 'gpt-3.5-turbo-0613', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-16k-0613', 'gpt-4', 'gpt-4-0613', 'gpt-4-32k', 'gpt-4-32k-0613', 'text-davinci-002-render-sha-mobile', 'text-embedding-ada-002', 'gpt-4-mobile', 'gpt-4-browsing',
]

export const chatModelOptions = [
  'gpt-3.5-turbo', 'gpt-3.5-turbo-0613', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-16k-0613', 'gpt-4', 'gpt-4-0613', 'gpt-4-32k', 'gpt-4-32k-0613', 'text-davinci-002-render-sha-mobile', 'text-embedding-ada-002', 'gpt-4-mobile', 'gpt-4-browsing',
].map((model: string) => {
  let label = model
  if (model === 'text-davinci-002-render-sha-mobile')
    label = 'gpt-3.5-mobile'
  return {
    label,
    key: model,
    value: model,
  }
})

export class ChatRoom {
  _id: ObjectId
  roomId: number
  userId: string
  title: string
  prompt: string
  usingContext: boolean
  status: Status = Status.Normal
  // only access token used
  accountId?: string
  chatModel: CHATMODEL
  constructor(userId: string, title: string, roomId: number) {
    this.userId = userId
    this.title = title
    this.prompt = undefined
    this.roomId = roomId
    this.usingContext = true
    this.accountId = null
    this.chatModel = null
  }
}

export class ChatOptions {
  parentMessageId?: string
  messageId?: string
  conversationId?: string
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  estimated?: boolean
  constructor(parentMessageId?: string, messageId?: string, conversationId?: string) {
    this.parentMessageId = parentMessageId
    this.messageId = messageId
    this.conversationId = conversationId
  }
}

export class previousResponse {
  response: string
  options: ChatOptions
}

export class ChatInfo {
  _id: ObjectId
  roomId: number
  uuid: number
  dateTime: number
  prompt: string
  response?: string
  status: Status = Status.Normal
  options: ChatOptions
  previousResponse?: previousResponse[]
  constructor(roomId: number, uuid: number, prompt: string, options: ChatOptions) {
    this.roomId = roomId
    this.uuid = uuid
    this.prompt = prompt
    this.options = options
    this.dateTime = new Date().getTime()
  }
}

export class UsageResponse {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  estimated: boolean
}

export class ChatUsage {
  _id: ObjectId
  userId: ObjectId
  roomId: number
  chatId: ObjectId
  messageId: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimated: boolean
  dateTime: number
  constructor(userId: ObjectId, roomId: number, chatId: ObjectId, messageId: string, usage: UsageResponse) {
    this.userId = userId
    this.roomId = roomId
    this.chatId = chatId
    this.messageId = messageId
    if (usage) {
      this.promptTokens = usage.prompt_tokens
      this.completionTokens = usage.completion_tokens
      this.totalTokens = usage.total_tokens
      this.estimated = usage.estimated
    }
    this.dateTime = new Date().getTime()
  }
}

export class Config {
  constructor(
    public _id: ObjectId,
    public timeoutMs: number,
    public apiKey?: string,
    public apiDisableDebug?: boolean,
    public accessToken?: string,
    public apiBaseUrl?: string,
    public apiModel?: APIMODEL,
    public reverseProxy?: string,
    public socksProxy?: string,
    public socksAuth?: string,
    public httpsProxy?: string,
    public siteConfig?: SiteConfig,
    public subscriptionConfig?: SubscriptionConfig,
    public announcementConfig?: AnnouncementConfig,
    public merchConfig?: MerchConfig,
    public featuresConfig?: FeaturesConfig,
    public mailConfig?: MailConfig,
    public auditConfig?: AuditConfig,
  ) { }
}

export class SiteConfig {
  constructor(
    public siteTitle?: string,
    public loginEnabled?: boolean,
    public loginSalt?: string,
    public registerEnabled?: boolean,
    public registerReview?: boolean,
    public registerMails?: string,
    public siteDomain?: string,
  ) { }
}

export interface SubData {
  enabled?: boolean
  title?: string
  price?: string
  details?: string
  message?: string
}

export class SubscriptionConfig {
  constructor(
    public premium?: SubData,
    public mvp?: SubData,
    public support?: SubData,
    public enterprise?: SubData,
    public basic?: SubData,
    public basicPlus?: SubData,
    public subURL?: string,
  ) { }
}

export class AnnouncementConfig {
  constructor(
    public announceEnabled?: boolean,
    public announceHeader?: string,
    public announceBody?: string,
    public announceFooter?: string,
  ) { }
}

export interface Product {
  img: string
  name: string
  price: number
  stock: boolean
}

export class MerchConfig {
  constructor(
    public lightBanner?: string,
    public darkBanner?: string,
    public products?: Product[],
  ) { }
}

export class FeaturesConfig {
  constructor(
    public chatFooterEnabled?: boolean,
    public chatFooterText?: string,
    public whiteboardEnabled?: boolean,
    public merchEnabled?: boolean,
    public internetAccessEnabled?: boolean,
  ) { }
}

export class MailConfig {
  constructor(
    public smtpHost: string,
    public smtpPort: number,
    public smtpTsl: boolean,
    public smtpUserName: string,
    public smtpPassword: string,
  ) { }
}

export class AuditConfig {
  constructor(
    public enabled: boolean,
    public provider: TextAuditServiceProvider,
    public options: TextAuditServiceOptions,
    public textType: TextAudioType,
    public customizeEnabled: boolean,
    public sensitiveWords: string,
  ) { }
}

export enum TextAudioType {
  None = 0,
  Request = 1 << 0, // binary 01
  Response = 1 << 1, // binary 10
  All = Request | Response, // binary 11
}

export class KeyConfig {
  _id: ObjectId
  key: string
  keyModel: APIMODEL
  chatModels: CHATMODEL[]
  userRoles: UserRole[]
  status: Status
  remark: string
  constructor(key: string, keyModel: APIMODEL, chatModels: CHATMODEL[], userRoles: UserRole[], remark: string) {
    this.key = key
    this.keyModel = keyModel
    this.chatModels = chatModels
    this.userRoles = userRoles
    this.status = Status.Normal
    this.remark = remark
  }
}

export type APIMODEL = 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
