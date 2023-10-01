<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NInput, NSpin, useMessage } from 'naive-ui'
import type { ConfigState, SubscriptionConfig } from './model'
import { fetchChatConfig, fetchUpdateSubscription } from '@/api'

const ms = useMessage()

const loading = ref(false)
const saving = ref(false)

const config = ref<SubscriptionConfig>()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data.subscriptionConfig
  }
  finally {
    loading.value = false
  }
}

async function updatePrice() {
  saving.value = true
  try {
    const { data } = await fetchUpdateSubscription(config.value as SubscriptionConfig)
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
          <span class="flex-shrink-0 w-[100px]">Premium</span>
          <div class="flex-1">
            <NInput
              :value="config && config.premiumPrice" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.premiumPrice = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Premium MSG</span>
          <div class="flex-1">
            <NInput
              :value="config && config.premiumMSG" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.premiumMSG = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">MVP</span>
          <div class="flex-1">
            <NInput
              :value="config && config.mvpPrice" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.mvpPrice = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">MVP MSG</span>
          <div class="flex-1">
            <NInput
              :value="config && config.mvpMSG" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.mvpMSG = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Support</span>
          <div class="flex-1">
            <NInput
              :value="config && config.supportPrice" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.supportPrice = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Support MSG</span>
          <div class="flex-1">
            <NInput
              :value="config && config.supportMSG" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.supportMSG = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Forum Link</span>
          <div class="flex-1">
            <NInput
              :value="config && config.subURL" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.subURL = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">QR Code</span>
          <div class="flex-1">
            <NInput
              :value="config && config.subImageLink" placeholder="" style="max-width: 30%"
              @input="(val: string | undefined) => { if (config) config.subImageLink = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]" />
          <div class="flex flex-wrap items-center gap-4">
            <NButton :loading="saving" type="primary" @click="updatePrice()">
              {{ $t('common.save') }}
            </NButton>
          </div>
        </div>
      </div>
    </div>
  </NSpin>
</template>
