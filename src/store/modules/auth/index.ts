import { defineStore } from 'pinia'
import jwt_decode from 'jwt-decode'
import type { UserInfo } from '../user/helper'
import { getToken, removeToken, setToken } from './helper'
import { store, useChatStore, useUserStore } from '@/store'
import { fetchLogout, fetchSession } from '@/api'
import { UserConfig } from '@/components/admin/model'

interface SessionResponse {
  auth: boolean
  authProxyEnabled: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
  allowRegister: boolean
  title: string
  chatModels: {
    label: string
    key: string
    value: string
  }[]
  allChatModels: {
    label: string
    key: string
    value: string
  }[]
  userInfo: { avatar: string; config: UserConfig; email: string; name: string; remark: string; root: boolean; title: string; userId: string; }
}

export interface AuthState {
  token: string | undefined
  session: SessionResponse | null
  tuc: { username: string; password: string } | null // temp user credentials
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
    tuc: null,
  }),

  getters: {
    isChatGPTAPI(state): boolean {
      return state.session?.model === 'ChatGPTAPI'
    },
  },

  actions: {
    async getSession() {
      try {
        const { data } = await fetchSession<SessionResponse>()
        this.session = { ...data }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    async setToken(token: string) {
      this.token = token
      const decoded = jwt_decode(token) as UserInfo
      const userStore = useUserStore()
      if (decoded.config === undefined || decoded.config === null) {
        decoded.config = new UserConfig()
        decoded.config.chatModel = 'gpt-3.5-turbo'
      }

      await userStore.updateUserInfo(false, {
        avatar: decoded.avatar,
        config: decoded.config,
        name: decoded.name,
        root: decoded.root,
        title: decoded.title,
      })
      setToken(token)
    },

    async removeToken() {
      this.token = undefined
      const userStore = useUserStore()
      userStore.resetUserInfo()
      const chatStore = useChatStore()
      await chatStore.clearLocalChat()
      removeToken()
      await fetchLogout()
    },

    setTempCredentials(username: string, password: string) {
      this.tuc = { username, password }
    },

    clearTempCredentials() {
      this.tuc = null
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
