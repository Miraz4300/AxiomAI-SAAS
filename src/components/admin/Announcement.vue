<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NInput, NSpin, NSwitch, useMessage } from 'naive-ui'
import type { AnnouncementConfig, ConfigState } from './model'
import { fetchChatConfig, fetchUpdateAnnouncement } from '@/api'

const ms = useMessage()

const loading = ref(false)
const saving = ref(false)

const config = ref<AnnouncementConfig>()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data.announcementConfig
  }
  finally {
    loading.value = false
  }
}

async function updateAnnouncement() {
  saving.value = true
  try {
    const { data } = await fetchUpdateAnnouncement(config.value as AnnouncementConfig)
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
        <span class="flex-shrink-0 w-[100px]">Enable Announcement</span>
        <div class="flex-1">
          <NSwitch
            :round="false" :value="config && config.announceEnabled"
            @update:value="(val: boolean | undefined) => { if (config) config.announceEnabled = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Header</span>
        <div class="flex-1">
          <NInput
            :value="config && config.announceHeader" placeholder=""
            @input="(val: string | undefined) => { if (config) config.announceHeader = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Body</span>
        <div class="flex-1">
          <NInput
            :value="config && config.announceBody" placeholder="" clearable type="textarea" :autosize="{ minRows: 4, maxRows: 20 }"
            @input="(val: string | undefined) => { if (config) config.announceBody = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Footer</span>
        <div class="flex-1">
          <NInput
            :value="config && config.announceFooter" placeholder=""
            @input="(val: string | undefined) => { if (config) config.announceFooter = val }"
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
