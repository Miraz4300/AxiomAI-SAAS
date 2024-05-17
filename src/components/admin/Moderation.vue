<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NInput, NSelect, NSpin, NSwitch } from 'naive-ui'
import type { AuditConfig, ConfigState, TextAuditServiceProvider } from './model'
import { fetchChatConfig, fetchTestAudit, fetchUpdateAudit } from '@/api'

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const testText = ref<string>()

const serviceOptions: { label: string; key: TextAuditServiceProvider; value: TextAuditServiceProvider }[] = [
  { label: 'Baidu cloud', key: 'baidu', value: 'baidu' },
]

const config = ref<AuditConfig>()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data.auditConfig
  }
  finally {
    loading.value = false
  }
}

async function updateAuditInfo() {
  saving.value = true
  try {
    const { data } = await fetchUpdateAudit(config.value as AuditConfig)
    config.value = data
    window.$message?.success('Saved Successfully')
  }
  catch (error: any) {
    window.$message?.error(error.message)
  }
  saving.value = false
}

async function testAudit() {
  testing.value = true
  try {
    const { message } = await fetchTestAudit(testText.value as string, config.value as AuditConfig) as { status: string; message: string }
    window.$message?.success(message)
  }
  catch (error: any) {
    window.$message?.error(error.message)
  }
  testing.value = false
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
          <span class="flex-shrink-0 w-[100px]">Customize</span>
          <div class="flex-1">
            <NSwitch
              :round="false" :value="config && config.customizeEnabled"
              @update:value="(val: boolean | undefined) => { if (config) config.customizeEnabled = val }"
            />
          </div>
        </div>
        <div v-if="config && config.customizeEnabled" class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Sensitive Words</span>
          <div class="flex-1">
            <NInput
              :value="config && config.sensitiveWords"
              placeholder="One word per line" style="width: 100%; max-width: 720px"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              @input="(val: string | undefined) => { if (config) config.sensitiveWords = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Third Party</span>
          <div class="flex-1">
            <NSwitch
              :round="false" :value="config && config.enabled"
              @update:value="(val: boolean | undefined) => { if (config) config.enabled = val }"
            />
          </div>
        </div>
        <div v-if="config && config.enabled" class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Provider</span>
          <div class="flex-1">
            <NSelect
              style="width: 140px"
              :value="config && config.provider"
              :options="serviceOptions"
              @update-value="(val: string) => { if (config) config.provider = val as TextAuditServiceProvider }"
            />
          </div>
        </div>
        <div v-if="config && config.enabled" class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">API Key</span>
          <div class="flex-1">
            <NInput
              :value="config && config.options && config.options.apiKey"
              placeholder="" style="width: 100%; max-width: 720px"
              @input="(val: string) => { if (config && config.options) config.options.apiKey = val }"
            />
          </div>
        </div>
        <div v-if="config && config.enabled" class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">API Secret</span>
          <div class="flex-1">
            <NInput
              :value="config && config.options && config.options.apiSecret"
              placeholder="" style="width: 100%; max-width: 720px"
              @input="(val: string) => { if (config && config.options) config.options.apiSecret = val }"
            />
          </div>
        </div>
        <div v-if="config && config.enabled" class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Label</span>
          <div class="flex-1">
            <NInput
              :value="config && config.options && config.options.label"
              placeholder="English comma separated, If empty, only politics." style="width: 100%; max-width: 720px"
              @input="(val: string | undefined) => { if (config && config.options) config.options.label = val }"
            />
            <p v-if="config && config.provider === 'baidu'">
              <a target="_blank" href="https://ai.baidu.com/ai-doc/ANTIPORN/Nk3h6xbb2#%E7%BB%86%E5%88%86%E6%A0%87%E7%AD%BE%E5%AF%B9%E7%85%A7%E8%A1%A8">Goto Label Detail</a>
            </p>
          </div>
        </div>
        <div v-if="config && (config.enabled || config.customizeEnabled)" class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Test Text</span>
          <div class="flex-1">
            <NInput
              v-model:value="testText"
              placeholder="" style="width: 100%; max-width: 720px"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]" />
          <div class="flex flex-wrap items-center gap-4">
            <NButton :loading="saving" type="primary" @click="updateAuditInfo()">
              {{ $t('common.save') }}
            </NButton>
            <NButton :loading="testing" type="info" @click="testAudit()">
              {{ $t('common.test') }}
            </NButton>
            <p class="text-xs text-[#b4bbc4] text-left">
              Sensitive words do not take effect on Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  </NSpin>
</template>
