export class ConfigState {
  timeoutMs?: number
  apiKey?: string
  accessToken?: string
  accessTokenExpiredTime?: string
  apiBaseUrl?: string
  apiModel?: APIMODEL
  reverseProxy?: string
  balance?: number
  siteConfig?: SiteConfig
  subscriptionConfig?: SubscriptionConfig
  announcementConfig?: AnnouncementConfig
  merchConfig?: MerchConfig
  mailConfig?: MailConfig
  auditConfig?: AuditConfig
  featuresConfig?: FeaturesConfig
}

export class UserConfig {
  chatModel?: string
}

export class SiteConfig {
  siteTitle?: string
  loginEnabled?: boolean
  loginSalt?: string
  registerEnabled?: boolean
  registerReview?: boolean
  registerMails?: string
  siteDomain?: string
  chatModels?: string
}

export interface SubData {
  enabled?: boolean
  title?: string
  price?: string
  details?: string
  message?: string
}

export class SubscriptionConfig {
  premium?: SubData
  mvp?: SubData
  support?: SubData
  enterprise?: SubData
  basic?: SubData
  basicPlus?: SubData
  subURL?: string
}

export class AnnouncementConfig {
  announceEnabled?: boolean
  announceHeader?: string
  announceBody?: string
  announceFooter?: string
}

export interface Product {
  img: string
  name: string
  price: number
  stock: boolean
  code: string
}

export class MerchConfig {
  lightBanner?: string
  darkBanner?: string
  products: Product[] = []
}

export class MailConfig {
  smtpHost?: string
  smtpPort?: number
  smtpTsl?: boolean
  smtpUserName?: string
  smtpPassword?: string
}
export type TextAuditServiceProvider = 'baidu' //  | 'ali'

export interface TextAuditServiceOptions {
  apiKey: string
  apiSecret: string
  label?: string
}
export enum TextAudioType {
  None = 0,
  Request = 1 << 0, // binary 01
  Response = 1 << 1, // binary 10
  All = Request | Response, // binary 11
}

export class AuditConfig {
  enabled?: boolean
  provider?: TextAuditServiceProvider
  options?: TextAuditServiceOptions
  textType?: TextAudioType
  customizeEnabled?: boolean
  sensitiveWords?: string
}

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
  Enterprise = 2,
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

export class KeyConfig {
  _id?: string
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

export type APIMODEL = 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI' | undefined

export const apiModelOptions = ['ChatGPTAPI', 'ChatGPTUnofficialProxyAPI'].map((model: string) => {
  return {
    label: model,
    key: model,
    value: model,
  }
})

export const userRoleOptions = Object.values(UserRole).filter(d => Number.isNaN(Number(d))).map((role) => {
  return {
    label: role as string,
    key: role as string,
    value: UserRole[role as keyof typeof UserRole],
  }
})

export class UserInfo {
  _id?: string
  avatar?: string
  email?: string
  password?: string
  status?: Status
  createTime?: string
  roles: UserRole[]
  remark?: string
  message?: string
  constructor(roles: UserRole[]) {
    this.roles = roles
  }
}

export class FeaturesConfig {
  chatFooterEnabled?: boolean
  chatFooterText?: string
  whiteboardEnabled?: boolean
  merchEnabled?: boolean
  internetAccessEnabled?: boolean
  cognitiveDocsEnabled?: boolean
}

export class UserPassword {
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export class TwoFAConfig {
  enabled: boolean
  userName: string
  secretKey: string
  otpauthUrl: string
  testCode: string
  constructor() {
    this.enabled = false
    this.userName = ''
    this.secretKey = ''
    this.otpauthUrl = ''
    this.testCode = ''
  }
}
