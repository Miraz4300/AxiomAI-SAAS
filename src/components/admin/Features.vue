<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NInput, NSpin, NSwitch, useMessage } from 'naive-ui'
import type { ConfigState, FeaturesConfig } from './model'
import { fetchChatConfig, fetchUpdateFeatures } from '@/api'

const ms = useMessage()

const loading = ref(false)
const saving = ref(false)

const config = ref<FeaturesConfig>()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data.featuresConfig
  }
  finally {
    loading.value = false
  }
}

async function updateAnnouncement() {
  saving.value = true
  try {
    const { data } = await fetchUpdateFeatures(config.value as FeaturesConfig)
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
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Chat Footer</span>
        <div class="flex-1">
          <NSwitch
            :round="false" :value="config && config.chatFooterEnabled"
            @update:value="(val: boolean | undefined) => { if (config) config.chatFooterEnabled = val }"
          />
        </div>
      </div>
      <div v-if="config && config.chatFooterEnabled" class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Footer Text</span>
        <div class="flex-1">
          <NInput
            :round="false" :value="config && config.chatFooterText" placeholder="footer text | support html" clearable type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" style="width: 100%; max-width: 720px"
            @input="(val: string | undefined) => { if (config) config.chatFooterText = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Whiteboard</span>
        <div class="flex-1">
          <NSwitch
            :round="false" :value="config && config.whiteboardEnabled"
            @update:value="(val: boolean | undefined) => { if (config) config.whiteboardEnabled = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Merch</span>
        <div class="flex-1">
          <NSwitch
            :round="false" :value="config && config.merchEnabled"
            @update:value="(val: boolean | undefined) => { if (config) config.merchEnabled = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Internet Access</span>
        <div class="flex-1">
          <NSwitch
            :round="false" :value="config && config.internetAccessEnabled"
            @update:value="(val: boolean | undefined) => { if (config) config.internetAccessEnabled = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Cognitive Documents</span>
        <div class="flex-1">
          <NSwitch
            :round="false" :value="config && config.cognitiveDocsEnabled"
            @update:value="(val: boolean | undefined) => { if (config) config.cognitiveDocsEnabled = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Voice Enable</span>
        <div class="flex-1">
          <NSwitch
            :round="false" :value="config && config.voiceEnabled"
            @update:value="(val: boolean | undefined) => { if (config) config.voiceEnabled = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Speech Enable</span>
        <div class="flex-1">
          <NSwitch
            :round="false" :value="config && config.speechEnabled"
            @update:value="(val: boolean | undefined) => { if (config) config.speechEnabled = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Vision Enable</span>
        <div class="flex-1">
          <NSwitch
            :round="false" :value="config && config.visionEnabled"
            @update:value="(val: boolean | undefined) => { if (config) config.visionEnabled = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]" />
        <div class="flex flex-wrap items-center gap-4">
          <NButton :loading="saving" type="primary" @click="updateAnnouncement()">
            {{ $t('common.save') }}
          </NButton>
        </div>
      </div>
    </div>
  </NSpin>
</template>
