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
  Banned = 7,
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
  createTime: Date
  verifyTime?: Date
  avatar?: string
  title?: string
  updateTime?: Date
  config?: UserConfig
  roles?: UserRole[]
  remark?: string
  secretKey?: string // MFA secret key
  message?: string // Notification message
  advanced?: AdvancedConfig // Advanced config for max context length
  activity?: ActivityData // Activity data
  constructor(email: string, password: string) {
    this.name = email
    this.email = email
    this.password = password
    this.status = Status.Unverified
    this.createTime = new Date()
    this.verifyTime = null
    this.updateTime = new Date()
    this.roles = [UserRole.Free]
    this.remark = null
  }
}

export class UserConfig {
  chatModel: string
}

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
  chatModel: string
  constructor(userId: string, title: string, roomId: number, chatModel: string) {
    this.userId = userId
    this.title = title
    this.prompt = undefined
    this.roomId = roomId
    this.usingContext = true
    this.accountId = null
    this.chatModel = chatModel
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
  images?: string[]
  response?: string
  status: Status = Status.Normal
  options: ChatOptions
  previousResponse?: previousResponse[]
  constructor(roomId: number, uuid: number, prompt: string, images: string[], options: ChatOptions) {
    this.roomId = roomId
    this.uuid = uuid
    this.prompt = prompt
    this.images = images
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
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimated: boolean
  dateTime: number
  constructor(userId: ObjectId, roomId: number, chatId: ObjectId, messageId: string, model: string, usage?: UsageResponse) {
    this.userId = userId
    this.roomId = roomId
    this.chatId = chatId
    this.messageId = messageId
    this.model = model
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
    public apiEnableDebug?: boolean,
    public accessToken?: string,
    public apiBaseUrl?: string,
    public apiModel?: APIMODEL,
    public reverseProxy?: string,
    public siteConfig?: SiteConfig,
    public subscriptionConfig?: SubscriptionConfig,
    public announcementConfig?: AnnouncementConfig,
    public merchConfig?: MerchConfig,
    public featuresConfig?: FeaturesConfig,
    public mailConfig?: MailConfig,
    public auditConfig?: AuditConfig,
    public advancedConfig?: AdvancedConfig,
  ) { }
}

export class SiteConfig {
  constructor(
    public siteTitle?: string,
    public loginEnabled?: boolean,
    public authProxyEnabled?: boolean,
    public loginSalt?: string,
    public registerEnabled?: boolean,
    public registerReview?: boolean,
    public registerMails?: string,
    public siteDomain?: string,
    public chatModels?: string,
    public rateLimit?: number,
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
    public basic?: SubData,
    public basicPlus?: SubData,
    public subURL?: string,
    public enterprise?: SubData,
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
  code: string
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
    public cognitiveDocsEnabled?: boolean,
    public voiceEnabled?: boolean,
    public speechEnabled?: boolean,
    public visionEnabled?: boolean,
  ) { }
}

export class MailConfig {
  constructor(
    public service: string,
    public smtpHost: string,
    public smtpPort: number,
    public smtpTsl: boolean,
    public tls: { ciphers: string; rejectUnauthorized: boolean },
    public smtpSenderEmail: string,
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

export class AdvancedConfig {
  constructor(
    public persona: string,
    public memory: number,
  ) { }
}

export class ActivityData {
  constructor(
    public lastActivity: string,
    public device: string,
    public ipAddress: string,
    public ipLocation: string,
    public usedSensitiveWords: string,
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
  chatModels: string[]
  userRoles: UserRole[]
  status: Status
  remark: string
  baseUrl?: string
  constructor(key: string, keyModel: APIMODEL, chatModels: string[], userRoles: UserRole[], remark: string) {
    this.key = key
    this.keyModel = keyModel
    this.chatModels = chatModels
    this.userRoles = userRoles
    this.status = Status.Normal
    this.remark = remark
  }
}

export type APIMODEL = 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
