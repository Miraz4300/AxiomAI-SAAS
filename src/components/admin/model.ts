export class ConfigState {
  timeoutMs?: number
  apiKey?: string
  accessToken?: string
  accessTokenExpiredTime?: string
  apiBaseUrl?: string
  apiModel?: APIMODEL
  reverseProxy?: string
  socksProxy?: string
  socksAuth?: string
  httpsProxy?: string
  balance?: number
  siteConfig?: SiteConfig
  subscriptionConfig?: SubscriptionConfig
  announcementConfig?: AnnouncementConfig
  mailConfig?: MailConfig
  auditConfig?: AuditConfig
}

// https://platform.openai.com/docs/models/overview
export type CHATMODEL = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-0613' | 'gpt-3.5-turbo-16k' | 'gpt-3.5-turbo-16k-0613' | 'gpt-4' | 'gpt-4-0613' | 'gpt-4-32k' | 'gpt-4-32k-0613' | 'text-davinci-002-render-sha-mobile' | 'text-embedding-ada-002' | 'gpt-4-mobile' | 'gpt-4-browsing'

export class UserConfig {
  chatModel?: CHATMODEL
}

export class SiteConfig {
  siteTitle?: string
  loginEnabled?: boolean
  loginSalt?: string
  registerEnabled?: boolean
  registerReview?: boolean
  registerMails?: string
  siteDomain?: string
}

export class SubscriptionConfig {
  premiumPrice?: string
  premiumMSG?: string
  mvpPrice?: string
  mvpMSG?: string
  supportPrice?: string
  supportMSG?: string
  subImageLink?: string
  subURL?: string
}

export class AnnouncementConfig {
  announceHeader?: string
  announceBody?: string
  announceFooter?: string
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
  PreVerify = 4,
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
  Contributor = 6,
  Developer = 7,
  Tester = 8,
  Partner = 9,
}

export class KeyConfig {
  _id?: string
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
  email?: string
  password?: string
  roles: UserRole[]
  constructor(roles: UserRole[]) {
    this.roles = roles
  }
}
