import { ss } from '@/utils/storage'

const LOCAL_NAME = 'subCache'

export interface SubState {
  premiumEnabled?: boolean
  premiumTitle?: string
  premiumPrice?: string
  premiumDetails?: string
  premiumMessage?: string
  mvpEnabled?: boolean
  mvpTitle?: string
  mvpPrice?: string
  mvpDetails?: string
  mvpMessage?: string
  supportEnabled?: boolean
  supportTitle?: string
  supportPrice?: string
  supportDetails?: string
  supportMessage?: string
  enterpriseEnabled?: boolean
  enterpriseTitle?: string
  enterprisePrice?: string
  enterpriseDetails?: string
  enterpriseMessage?: string
  basicEnabled?: boolean
  basicTitle?: string
  basicPrice?: string
  basicDetails?: string
  basicMessage?: string
  basicPlusEnabled?: boolean
  basicPlusTitle?: string
  basicPlusPrice?: string
  basicPlusDetails?: string
  basicPlusMessage?: string
  subImageLink?: string
  subURL?: string
}

export function defaultSetting(): SubState {
  return {
    premiumEnabled: false,
    premiumTitle: '',
    premiumPrice: '',
    premiumDetails: '',
    premiumMessage: '',
    mvpEnabled: false,
    mvpTitle: '',
    mvpPrice: '',
    mvpDetails: '',
    mvpMessage: '',
    supportEnabled: false,
    supportTitle: '',
    supportPrice: '',
    supportDetails: '',
    supportMessage: '',
    enterpriseEnabled: false,
    enterpriseTitle: '',
    enterprisePrice: '',
    enterpriseDetails: '',
    enterpriseMessage: '',
    basicEnabled: false,
    basicTitle: '',
    basicPrice: '',
    basicDetails: '',
    basicMessage: '',
    basicPlusEnabled: false,
    basicPlusTitle: '',
    basicPlusPrice: '',
    basicPlusDetails: '',
    basicPlusMessage: '',
    subImageLink: '',
    subURL: '',
  }
}

export function getLocalSetting(): SubState {
  const localSetting: SubState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalSetting(setting: SubState): void {
  ss.set(LOCAL_NAME, setting)
}
