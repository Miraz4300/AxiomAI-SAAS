import { defineStore } from 'pinia'
import type { PromptStore } from './helper'
import { getLocalPromptList } from './helper'

export const usePromptStore = defineStore('prompt-store', {
  state: (): PromptStore => getLocalPromptList(),

  actions: {
    getPromptList() {
      return this.$state
    },
  },
})
