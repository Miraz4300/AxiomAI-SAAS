import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { get, post } from '@/utils/request'
import type { AnnouncementConfig, AuditConfig, CHATMODEL, ConfigState, FeaturesConfig, KeyConfig, MailConfig, MerchConfig, SiteConfig, Status, SubscriptionConfig, UserInfo } from '@/components/admin/model'
import { useAuthStore, useSettingStore } from '@/store'

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/oauth3',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    roomId: number
    uuid: number
    regenerate?: boolean
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const settingStore = useSettingStore()
  const authStore = useAuthStore()

  let data: Record<string, any> = {
    roomId: params.roomId,
    uuid: params.uuid,
    regenerate: params.regenerate || false,
    prompt: params.prompt,
    options: params.options,
  }

  if (authStore.isChatGPTAPI) {
    data = {
      ...data,
      memory: settingStore.memory,
      persona: settingStore.persona,
    }
  }

  return post<T>({
    url: '/conversation',
    data,
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchAzureToken<T>() {
  return post<T>({
    url: '/voice',
  })
}

export function fetchChatStopResponding<T = any>(text: string, messageId: string, conversationId: string) {
  return post<T>({
    url: '/chat-abort',
    data: { text, messageId, conversationId },
  })
}

export function fetchChatResponseoHistory<T = any>(roomId: number, uuid: number, index: number) {
  return get<T>({
    url: '/chat-response-history',
    data: { roomId, uuid, index },
  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verification',
    data: { token },
  })
}

export function fetchVerifyAdmin<T>(token: string) {
  return post<T>({
    url: '/admin-verification',
    data: { token },
  })
}

export function fetchLogin<T = any>(username: string, password: string) {
  return post<T>({
    url: '/user-login',
    data: { username, password },
  })
}

export function fetchSendResetMail<T = any>(username: string) {
  return post<T>({
    url: '/user-send-reset-mail',
    data: { username },
  })
}

export function fetchResetPassword<T = any>(username: string, password: string, sign: string) {
  return post<T>({
    url: '/user-reset-password',
    data: { username, password, sign },
  })
}

export function fetchRegister<T = any>(username: string, password: string) {
  return post<T>({
    url: '/user-register',
    data: { username, password },
  })
}

export function fetchUpdateUserInfo<T = any>(name: string, avatar: string, description: string) {
  return post<T>({
    url: '/user-info',
    data: { name, avatar, description },
  })
}

export function fetchUpdateUserChatModel<T = any>(chatModel: CHATMODEL) {
  return post<T>({
    url: '/user-chat-model',
    data: { chatModel },
  })
}

export function fetchGetUsers<T = any>(page: number, size: number) {
  return get<T>({
    url: '/users',
    data: { page, size },
  })
}

export function fetchUpdateUserStatus<T = any>(userId: string, status: Status) {
  return post<T>({
    url: '/user-status',
    data: { userId, status },
  })
}

export function fetchUpdateUser<T = any>(userInfo: UserInfo) {
  return post<T>({
    url: '/user-edit',
    data: { userId: userInfo._id, roles: userInfo.roles, email: userInfo.email, password: userInfo.password },
  })
}

export function fetchGetChatRooms<T = any>() {
  return get<T>({
    url: '/chatrooms',
  })
}

export function fetchCreateChatRoom<T = any>(title: string, roomId: number) {
  return post<T>({
    url: '/room-create',
    data: { title, roomId },
  })
}

export function fetchRenameChatRoom<T = any>(title: string, roomId: number) {
  return post<T>({
    url: '/room-rename',
    data: { title, roomId },
  })
}

export function fetchUpdateChatRoomPrompt<T = any>(prompt: string, roomId: number) {
  return post<T>({
    url: '/room-prompt',
    data: { prompt, roomId },
  })
}

export function fetchUpdateChatRoomUsingContext<T = any>(using: boolean, roomId: number) {
  return post<T>({
    url: '/room-context',
    data: { using, roomId },
  })
}

export function fetchDeleteChatRoom<T = any>(roomId: number) {
  return post<T>({
    url: '/room-delete',
    data: { roomId },
  })
}

export function fetchGetChatHistory<T = any>(roomId: number, lastId?: number) {
  return get<T>({
    url: `/chat-history?roomId=${roomId}&lastId=${lastId}`,
  })
}

export function fetchClearAllChat<T = any>() {
  return post<T>({
    url: '/chat-clear-all',
    data: { },
  })
}

export function fetchClearChat<T = any>(roomId: number) {
  return post<T>({
    url: '/chat-clear',
    data: { roomId },
  })
}

export function fetchDeleteChat<T = any>(roomId: number, uuid: number, inversion?: boolean) {
  return post<T>({
    url: '/chat-delete',
    data: { roomId, uuid, inversion },
  })
}

export function fetchUpdateMail<T = any>(mail: MailConfig) {
  return post<T>({
    url: '/setting-mail',
    data: mail,
  })
}

export function fetchTestMail<T = any>(mail: MailConfig) {
  return post<T>({
    url: '/mail-test',
    data: mail,
  })
}

export function fetchUpdateAudit<T = any>(audit: AuditConfig) {
  return post<T>({
    url: '/setting-audit',
    data: audit,
  })
}

export function fetchTestAudit<T = any>(text: string, audit: AuditConfig) {
  return post<T>({
    url: '/audit-test',
    data: { audit, text },
  })
}

export function fetchUpdateSite<T = any>(config: SiteConfig) {
  return post<T>({
    url: '/setting-site',
    data: config,
  })
}

export function fetchUpdateSubscription<T = any>(config: SubscriptionConfig) {
  return post<T>({
    url: '/setting-subscription',
    data: config,
  })
}

export function fetchUserSubscription<T = any>() {
  return get<T>({
    url: '/user-subscription',
  })
}

export function fetchUpdateAnnouncement<T = any>(config: AnnouncementConfig) {
  return post<T>({
    url: '/setting-announcement',
    data: config,
  })
}

export function fetchUserAnnouncement<T = any>() {
  return get<T>({
    url: '/user-announcement',
  })
}

export function fetchUpdateMerch<T = any>(config: MerchConfig) {
  return post<T>({
    url: '/setting-merch',
    data: config,
  })
}

export function fetchUserMerch<T = any>() {
  return get<T>({
    url: '/user-merch',
  })
}

export function fetchUpdateBaseSetting<T = any>(config: ConfigState) {
  return post<T>({
    url: '/setting-system',
    data: config,
  })
}

export function fetchUserStatistics<T = any>(start: number, end: number) {
  return post<T>({
    url: '/statistics/by-day',
    data: { start, end },
  })
}

export function fetchGetKeys<T = any>(page: number, size: number) {
  return get<T>({
    url: '/setting-keys',
    data: { page, size },
  })
}

export function fetchUpdateApiKeyStatus<T = any>(id: string, status: Status) {
  return post<T>({
    url: '/setting-key-status',
    data: { id, status },
  })
}

export function fetchUpsertApiKey<T = any>(keyConfig: KeyConfig) {
  return post<T>({
    url: '/setting-key-upsert',
    data: keyConfig,
  })
}

export function fetchUpdateFeatures<T = any>(config: FeaturesConfig) {
  return post<T>({
    url: '/setting-features',
    data: config,
  })
}

export function fetchUserFeatures<T = any>() {
  return get<T>({
    url: '/user-features',
  })
}
