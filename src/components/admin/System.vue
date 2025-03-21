<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NInput, NSpin } from 'naive-ui'
import { ConfigState } from './model'
import { fetchChatConfig, fetchUpdateBaseSetting } from '@/api'

const loading = ref(false)
const saving = ref(false)

const config = ref(new ConfigState())

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data
  }
  finally {
    loading.value = false
  }
}

async function updateBaseSetting(baseConfig?: Partial<ConfigState>) {
  if (!baseConfig)
    return
  saving.value = true
  try {
    const { data } = await fetchUpdateBaseSetting(baseConfig)
    config.value = data
    window.$message?.success('Saved Successfully')
  }
  catch (error: any) {
    window.$message?.error(error.message)
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
          <span class="flex-shrink-0 w-[100px]">API Base URL</span>
          <div class="flex-1">
            <NInput :value="config.apiBaseUrl" placeholder="https://api.openai.com, Only used by ChatGPTAPI" style="width: 100%; max-width: 720px" @input="(val: string | undefined) => { config.apiBaseUrl = val }" />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Reverse Proxy</span>
          <div class="flex-1">
            <NInput :value="config.reverseProxy" placeholder="Only used by ChatGPTUnofficialProxyAPI" style="width: 100%; max-width: 720px" @input="(val: string | undefined) => { config.reverseProxy = val }" />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Timeout (ms)</span>
          <div class="flex-1">
            <NInput :value="config.timeoutMs !== undefined ? String(config.timeoutMs) : undefined" placeholder="" style="width: 100%; max-width: 720px" @input="(val: any) => { config.timeoutMs = typeof val === 'string' ? Number(val) : undefined }" />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]" />
          <NButton :loading="saving" type="primary" @click="updateBaseSetting(config)">
            {{ $t('common.save') }}
          </NButton>
        </div>
      </div>
    </div>
  </NSpin>
</template>
