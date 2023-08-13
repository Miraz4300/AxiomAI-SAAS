import { ss } from '@/utils/storage'

const LOCAL_NAME = 'SpeechConfig'
const enableSpeech = import.meta.env.VITE_ENABLE_SPEECH === 'true'

export interface SpeechConfig {
  enable?: boolean // Enable or not, do not store in ss
  showTip: boolean // Whether to display command prompts for voice input

  autoSpeak?: boolean // Whether to play automatically, not stored in ss
  speechSetting: {
    // A voice native object, not stored in ss
    voice?: SpeechSynthesisVoice
    lang: string
    sound?: string
    pitch: number
    rate: number
    useDefault: boolean
  }
}

export function defaultState(): SpeechConfig {
  return {
    enable: enableSpeech,
    showTip: true,
    autoSpeak: false,
    speechSetting: {
      lang: 'en-US',
      pitch: 1,
      rate: 1,
      useDefault: false,
    },
  }
}

export function getLocalState(): SpeechConfig {
  const defaultConfig = defaultState()
  const localState: SpeechConfig | null = ss.get(LOCAL_NAME)
  return {
    ...defaultConfig,
    ...localState,
    enable: enableSpeech,
    speechSetting: {
      ...defaultConfig.speechSetting,
      ...localState?.speechSetting,
    },
  }
}

export function setLocalState(state?: SpeechConfig) {
  const defaultConfig = defaultState()
  const { enable: _enable, autoSpeak: _autoSpeak, ...other } = state || {}
  const { voice: _voice, ...otherSpeechSetting } = state?.speechSetting || {}
  const newData: SpeechConfig = {
    ...defaultConfig,
    ...other,
    speechSetting: { ...defaultConfig.speechSetting, ...otherSpeechSetting },
  }
  ss.set(LOCAL_NAME, newData)
}

export function removeLocalState() {
  ss.remove(LOCAL_NAME)
}
