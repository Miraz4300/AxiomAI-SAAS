<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NInput, NSpin, NSwitch, useMessage } from 'naive-ui'
import type { ConfigState } from './model'
import { SiteConfig } from './model'
import { fetchChatConfig, fetchUpdateSite } from '@/api'

const ms = useMessage()

const loading = ref(false)
const saving = ref(false)

const config = ref<SiteConfig>()
config.value = new SiteConfig()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data.siteConfig
  }
  finally {
    loading.value = false
  }
}

async function updateSiteInfo(site?: SiteConfig) {
  if (!site)
    return

  saving.value = true
  try {
    const { data } = await fetchUpdateSite(site)
    config.value = data
    ms.success('Saved Successfully')
  }
  catch (error: any) {
    ms.error(error.message)
  }
  saving.value = false
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-5 min-h-[200px]">
      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Title</span>
          <div class="flex-1">
            <NInput
              :value="config && config.siteTitle" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.siteTitle = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Domain</span>
          <div class="flex-1">
            <NInput
              :value="config && config.siteDomain" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.siteDomain = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Login Enabled</span>
          <div class="flex-1">
            <NSwitch
              :round="false"
              :disabled="config && config.loginEnabled"
              :value="config && config.loginEnabled"
              @update:value="(val: boolean | undefined) => { if (config) config.loginEnabled = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Login Salt</span>
          <div class="flex-1">
            <NInput
              :value="config && config.loginSalt" placeholder="Changes will invalidate all logged-in users." style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.loginSalt = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Register Enabled</span>
          <div class="flex-1">
            <NSwitch
              :round="false"
              :value="config && config.registerEnabled"
              @update:value="(val: boolean | undefined) => { if (config) config.registerEnabled = val }"
            />
          </div>
        </div>
        <div v-show="config && config.registerEnabled" class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Register Review</span>
          <div class="flex-1">
            <NSwitch
              :round="false"
              :value="config && config.registerReview"
              @update:value="(val: boolean | undefined) => { if (config) config.registerReview = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Email domains</span>
          <div class="flex-1">
            <NInput
              :value="config && config.registerMails" placeholder="Only email addresses with these suffixes are allowed to register on this website." style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.registerMails = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]" />
          <NButton :loading="saving" type="primary" @click="updateSiteInfo(config)">
            {{ $t('common.save') }}
          </NButton>
        </div>
      </div>
    </div>
  </NSpin>
</template>
