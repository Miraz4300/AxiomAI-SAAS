import { ObjectId } from 'mongodb'
import * as dotenv from 'dotenv'
import type { TextAuditServiceProvider } from 'src/utils/textAudit'
import { isNotEmptyString, isTextAuditServiceProvider } from '../utils/is'
import { AdvancedConfig, AnnouncementConfig, AuditConfig, Config, FeaturesConfig, KeyConfig, MailConfig, MerchConfig, SiteConfig, SubscriptionConfig, TextAudioType, UserRole } from './model'
import { getConfig, getKeys, upsertKey } from './storage'

dotenv.config()

let cachedConfig: Config | undefined
let cacheExpiration = 0

export async function getCacheConfig(): Promise<Config> {
  const now = Date.now()
  if (cachedConfig && cacheExpiration > now)
    return Promise.resolve(cachedConfig)

  const loadedConfig = await getOriginConfig()

  cachedConfig = loadedConfig
  cacheExpiration = now + 10 * 60 * 1000

  return Promise.resolve(cachedConfig)
}

export async function getOriginConfig() {
  let config = await getConfig()
  if (config == null) {
    const tls = {
      ciphers: process.env.SMTP_TLS_CIPHERS || '',
      rejectUnauthorized: process.env.SMTP_TLS_RU === 'true',
    }
    config = new Config(new ObjectId(),
      !Number.isNaN(+process.env.TIMEOUT_MS) ? +process.env.TIMEOUT_MS : 600 * 1000,
      process.env.OPENAI_API_KEY,
      process.env.DISABLE_DEBUG === 'true',
      process.env.OPENAI_ACCESS_TOKEN,
      process.env.OPENAI_API_BASE_URL,
      process.env.OPENAI_API_MODEL === 'ChatGPTUnofficialProxyAPI' ? 'ChatGPTUnofficialProxyAPI' : 'ChatGPTAPI',
      process.env.API_REVERSE_PROXY,
      new SiteConfig(
        process.env.SITE_TITLE || 'AxiomAI',
        isNotEmptyString(process.env.AUTH_SECRET_KEY),
        process.env.AUTH_PROXY_ENABLED === 'true',
        process.env.AUTH_SECRET_KEY,
        process.env.REGISTER_ENABLED === 'true',
        process.env.REGISTER_REVIEW === 'true',
        process.env.REGISTER_MAILS,
        process.env.SITE_DOMAIN),
      new SubscriptionConfig(),
      new AnnouncementConfig(),
      new MerchConfig(),
      new FeaturesConfig(),
      new MailConfig(
        process.env.SMTP_SERVICE,
        process.env.SMTP_HOST,
        !Number.isNaN(+process.env.SMTP_PORT) ? +process.env.SMTP_PORT : 465,
        process.env.SMTP_TLS === 'true',
        tls,
        process.env.SMTP_SENDER_EMAIL,
        process.env.SMTP_USERNAME,
        process.env.SMTP_PASSWORD))
  }
  else {
    if (config.siteConfig.loginEnabled === undefined)
      config.siteConfig.loginEnabled = isNotEmptyString(process.env.AUTH_SECRET_KEY)
    if (config.siteConfig.authProxyEnabled === undefined)
      config.siteConfig.authProxyEnabled = process.env.AUTH_PROXY_ENABLED === 'true'
    if (config.siteConfig.loginSalt === undefined)
      config.siteConfig.loginSalt = process.env.AUTH_SECRET_KEY
    if (config.apiEnableDebug === undefined)
      config.apiEnableDebug = process.env.ENABLE_DEBUG === 'true'
    if (config.siteConfig.registerReview === undefined)
      config.siteConfig.registerReview = process.env.REGISTER_REVIEW === 'true'
  }
  if (config.apiModel !== 'ChatGPTAPI' && config.apiModel !== 'ChatGPTUnofficialProxyAPI') {
    if (isNotEmptyString(config.accessToken))
      config.apiModel = 'ChatGPTUnofficialProxyAPI'
    else
      config.apiModel = 'ChatGPTAPI'
  }

  if (config.auditConfig === undefined) {
    config.auditConfig = new AuditConfig(
      process.env.AUDIT_ENABLED === 'true',
      isTextAuditServiceProvider(process.env.AUDIT_PROVIDER)
        ? process.env.AUDIT_PROVIDER as TextAuditServiceProvider
        : 'baidu',
      {
        apiKey: process.env.AUDIT_API_KEY,
        apiSecret: process.env.AUDIT_API_SECRET,
        label: process.env.AUDIT_TEXT_LABEL,
      },
      getTextAuditServiceOptionFromString(process.env.AUDIT_TEXT_TYPE),
      false,
      '',
    )
  }

  if (!config.advancedConfig) {
    config.advancedConfig = new AdvancedConfig(
      'balanced',
      5,
    )
  }

  if (!isNotEmptyString(config.siteConfig.chatModels))
    config.siteConfig.chatModels = 'gpt-3.5-turbo,gpt-3.5-turbo-1106,gpt-3.5-turbo-0125,gpt-4-turbo,gpt-4-turbo-preview,gpt-4o,gpt-4-vision-preview,gemini-1.0-pro,gemini-1.5-flash-latest,gemini-1.5-pro-latest'

  return config
}

function getTextAuditServiceOptionFromString(value: string): TextAudioType {
  if (value === undefined)
    return TextAudioType.None

  switch (value.toLowerCase()) {
    case 'request':
      return TextAudioType.Request
    case 'response':
      return TextAudioType.Response
    case 'all':
      return TextAudioType.All
    default:
      return TextAudioType.None
  }
}

export function clearConfigCache() {
  cacheExpiration = 0
  cachedConfig = null
}

let apiKeysCachedConfig: KeyConfig[] | undefined
let apiKeysCacheExpiration = 0

export async function getCacheApiKeys(): Promise<KeyConfig[]> {
  const now = Date.now()
  if (apiKeysCachedConfig && apiKeysCacheExpiration > now)
    return Promise.resolve(apiKeysCachedConfig)

  const loadedConfig = (await getApiKeys()).keys

  apiKeysCachedConfig = loadedConfig
  apiKeysCacheExpiration = now + 10 * 60 * 1000

  return Promise.resolve(apiKeysCachedConfig)
}

export function clearApiKeyCache() {
  apiKeysCacheExpiration = 0
  getCacheApiKeys()
}

export async function getApiKeys() {
  const result = await getKeys()
  const config = await getCacheConfig()
  if (result.keys.length <= 0) {
    const config = await getCacheConfig()
    if (config.apiModel === 'ChatGPTAPI')
      result.keys.push(await upsertKey(new KeyConfig(config.apiKey, 'ChatGPTAPI', [], [], '')))

    if (config.apiModel === 'ChatGPTUnofficialProxyAPI')
      result.keys.push(await upsertKey(new KeyConfig(config.accessToken, 'ChatGPTUnofficialProxyAPI', [], [], '')))

    result.total++
  }
  result.keys.forEach((key) => {
    if (key.userRoles == null || key.userRoles.length <= 0)
      key.userRoles.push(UserRole.Admin)
    if (key.chatModels == null || key.chatModels.length <= 0) {
      config.siteConfig.chatModels.split(',').forEach((chatModel) => {
        key.chatModels.push(chatModel)
      })
    }
  })
  return result
}

export const authProxyHeaderName = process.env.AUTH_PROXY_HEADER_NAME ?? 'X-Email'
