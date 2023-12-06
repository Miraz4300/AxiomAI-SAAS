import { UserConfig } from '@/components/admin/model'
import type { UserRole } from '@/components/admin/model'
import { ss } from '@/utils/storage'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string
  email: string
  name: string
  description: string
  message?: string
  root: boolean
  config: UserConfig
  roles: UserRole[]
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: '',
      email: '',
      name: '',
      description: '',
      message: '',
      root: false,
      config: { chatModel: 'gpt-3.5-turbo' },
      roles: [],
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  if (localSetting != null && localSetting.userInfo != null && localSetting.userInfo.config == null) {
    localSetting.userInfo.config = new UserConfig()
    localSetting.userInfo.config.chatModel = 'gpt-3.5-turbo'
  }
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
