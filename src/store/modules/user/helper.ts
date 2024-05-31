import { UserConfig } from '@/components/admin/model'
import type { UserRole } from '@/components/admin/model'
import { ss } from '@/utils/storage'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  advanced: SettingsState
  avatar: string
  config: UserConfig
  email: string
  name: string
  remark: string
  roles: UserRole[]
  root: boolean
  title: string
}

export interface UserState {
  userInfo: UserInfo
}

export interface SettingsState {
  persona: string
  memory: number
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      advanced: { persona: 'balanced', memory: 5 },
      avatar: '',
      config: { chatModel: 'gpt-3.5-turbo' },
      email: '',
      name: '',
      remark: '',
      roles: [],
      root: false,
      title: '',
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  if (localSetting != null && localSetting.userInfo != null) {
    if (localSetting.userInfo.config == null) {
      localSetting.userInfo.config = new UserConfig()
      localSetting.userInfo.config.chatModel = 'gpt-3.5-turbo'
    }
    if (!localSetting.userInfo.advanced) {
      localSetting.userInfo.advanced = {
        persona: 'balanced',
        memory: 5,
      }
    }
  }
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
