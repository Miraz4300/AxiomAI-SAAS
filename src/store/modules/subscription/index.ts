import { defineStore } from 'pinia'
import { fetchUserSubscription } from '../../../api/'
import type { SubState } from './helper'
import { getLocalSetting, setLocalSetting } from './helper'
import { store } from '@/store'
import type { SubscriptionConfig } from '@/components/admin/model'

export const useSubStore = defineStore('sub-store', {
  state: (): SubState => getLocalSetting(),
  actions: {
    async UserSubscription() {
      const response = await fetchUserSubscription()
      const subData: SubscriptionConfig = response.data
      this.premiumEnabled = subData.premium?.enabled
      this.premiumTitle = subData.premium?.title
      this.premiumPrice = subData.premium?.price
      this.premiumDetails = subData.premium?.details
      this.premiumMessage = subData.premium?.message
      this.mvpEnabled = subData.mvp?.enabled
      this.mvpTitle = subData.mvp?.title
      this.mvpPrice = subData.mvp?.price
      this.mvpDetails = subData.mvp?.details
      this.mvpMessage = subData.mvp?.message
      this.supportEnabled = subData.support?.enabled
      this.supportTitle = subData.support?.title
      this.supportPrice = subData.support?.price
      this.supportDetails = subData.support?.details
      this.supportMessage = subData.support?.message
      this.enterpriseEnabled = subData.enterprise?.enabled
      this.enterpriseTitle = subData.enterprise?.title
      this.enterprisePrice = subData.enterprise?.price
      this.enterpriseDetails = subData.enterprise?.details
      this.enterpriseMessage = subData.enterprise?.message
      this.basicEnabled = subData.basic?.enabled
      this.basicTitle = subData.basic?.title
      this.basicPrice = subData.basic?.price
      this.basicDetails = subData.basic?.details
      this.basicMessage = subData.basic?.message
      this.basicPlusEnabled = subData.basicPlus?.enabled
      this.basicPlusTitle = subData.basicPlus?.title
      this.basicPlusPrice = subData.basicPlus?.price
      this.basicPlusDetails = subData.basicPlus?.details
      this.basicPlusMessage = subData.basicPlus?.message
      this.subImageLink = subData.subImageLink
      this.subURL = subData.subURL
      this.recordState()
    },

    recordState() {
      setLocalSetting(this.$state)
    },
  },
})

export function useSubStoreWithOut() {
  return useSubStore(store)
}
