import { defineStore } from 'pinia'
import { fetchUserFeatures } from '../../../api/'
import type { AppState, Language, Theme } from './helper'
import { getLocalSetting, setLocalSetting } from './helper'
import { store } from '@/store'
import type { FeaturesConfig } from '@/components/admin/model'

export const useAppStore = defineStore('app-store', {
  state: (): AppState => getLocalSetting(),
  actions: {
    setSiderCollapsed(collapsed: boolean) {
      this.siderCollapsed = collapsed
      this.recordState()
    },

    setTheme(theme: Theme) {
      this.theme = theme
      this.recordState()
    },

    setLanguage(language: Language) {
      if (this.language !== language) {
        this.language = language
        this.recordState()
      }
    },

    async UserFeatures() {
      const response = await fetchUserFeatures()
      const featuresConfig: FeaturesConfig = response.data
      this.chatFooterEnabled = featuresConfig.chatFooterEnabled
      this.chatFooterText = featuresConfig.chatFooterText
      this.whiteboardEnabled = featuresConfig.whiteboardEnabled
      this.merchEnabled = featuresConfig.merchEnabled
      this.internetAccessEnabled = featuresConfig.internetAccessEnabled
      this.cognitiveDocsEnabled = featuresConfig.cognitiveDocsEnabled
      this.visionEnabled = featuresConfig.visionEnabled
      this.recordState()
    },

    recordState() {
      setLocalSetting(this.$state)
    },
  },
})

export function useAppStoreWithOut() {
  return useAppStore(store)
}
