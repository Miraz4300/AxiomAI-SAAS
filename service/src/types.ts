import type { FetchFn } from 'chatgpt'
import type { JwtPayload } from 'jsonwebtoken'

export interface RequestProps {
  roomId: number
  uuid: number
  regenerate: boolean
  prompt: string
  uploadFileKeys?: string[]
  options?: ChatContext
  systemMessage: string
  persona: string
  language: string
}

export interface ChatContext {
  conversationId?: string
  parentMessageId?: string
}

export interface ChatGPTUnofficialProxyAPIOptions {
  accessToken: string
  apiReverseProxyUrl?: string
  model?: string
  debug?: boolean
  headers?: Record<string, string>
  fetch?: FetchFn
}

export interface ModelConfig {
  apiModel?: APIMODEL
  reverseProxy?: string
  timeoutMs?: number
  allowRegister?: boolean
  balance?: string
  accessTokenExpiredTime?: string
}

export type APIMODEL = 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI' | undefined

export interface JWT {
  'https://api.openai.com/profile': {
    'email': string
    'email_verified': boolean
  }
  'https://api.openai.com/auth': {
    'user_id': string
  }
  'iss': string
  'sub': string
  'aud': []
  'iat': number
  'exp': number
  'azp': string
  'scope': string
}

export interface AuthJwtPayload extends JwtPayload {
  avatar: string
  config: any
  name: string
  root: boolean
  title: string
  userId: string
}

export class MFAConfig {
  enabled: boolean
  userName: string
  secretKey: string
  otpauthUrl: string
  constructor() {
    this.enabled = false
    this.userName = ''
    this.secretKey = ''
    this.otpauthUrl = ''
  }
}
