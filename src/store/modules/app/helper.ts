import { ss } from '@/utils/storage'

const LOCAL_NAME = 'appSetting'

export type Theme = 'light' | 'dark' | 'auto'

export type Language = 'bn-BD' | 'en-US'

export interface AppState {
  siderCollapsed: boolean
  theme: Theme
  language: Language
  chatFooterEnabled?: boolean
  chatFooterText?: string
  whiteboardEnabled?: boolean
  merchEnabled?: boolean
  internetAccessEnabled?: boolean
  cognitiveDocsEnabled?: boolean
  visionEnabled?: boolean
  [key: string]: boolean | Theme | Language | string | undefined // TODO: This makes the interface less strict, which could potentially lead to bugs or unexpected behavior.
}

export function defaultSetting(): AppState {
  return { siderCollapsed: false, theme: 'auto', language: 'en-US', chatFooterEnabled: false, chatFooterText: '', whiteboardEnabled: false, merchEnabled: false, internetAccessEnabled: false, cognitiveDocsEnabled: false, visionEnabled: false }
}

export function getLocalSetting(): AppState {
  const localSetting: AppState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalSetting(setting: AppState): void {
  ss.set(LOCAL_NAME, setting)
}
