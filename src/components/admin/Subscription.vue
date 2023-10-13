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
    if (data.subscriptionConfig) {
      config.value = data.subscriptionConfig
    }
    else {
      // Create a default SubscriptionConfig if it doesn't exist
      config.value = {
        premium: { price: '', details: '', message: '' },
        mvp: { price: '', details: '', message: '' },
        support: { price: '', details: '', message: '' },
      }
      // Save the default SubscriptionConfig to the database
      await fetchUpdateSubscription(config.value)
    }
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
    <div class="flex flex-col p-4 space-y-6">
      <div class="flex-col">
        Premium:
        <div class="flex flex-col space-y-2 w-full">
          <NInput
            :value="config && config.premium && config.premium.details" placeholder="premium details" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
            @input="(val: string | undefined) => { if (config && config.premium) config.premium.details = val }"
          />
          <div class="flex space-x-2">
            <NInput
              :value="config && config.premium && config.premium.price" placeholder="premium price"
              @input="(val: string | undefined) => { if (config && config.premium) config.premium.price = val }"
            />
            <NInput
              :value="config && config.premium && config.premium.message" placeholder="after buy message"
              @input="(val: string | undefined) => { if (config && config.premium) config.premium.message = val }"
            />
          </div>
        </div>
      </div>
      <div class="flex-col">
        MVP:
        <div class="flex flex-col space-y-2 w-full">
          <NInput
            :value="config && config.mvp && config.mvp.details" placeholder="mvp details" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
            @input="(val: string | undefined) => { if (config && config.mvp) config.mvp.details = val }"
          />
          <div class="flex space-x-2">
            <NInput
              :value="config && config.mvp && config.mvp.price" placeholder="mvp price"
              @input="(val: string | undefined) => { if (config && config.mvp) config.mvp.price = val }"
            />
            <NInput
              :value="config && config.mvp && config.mvp.message" placeholder="after buy message"
              @input="(val: string | undefined) => { if (config && config.mvp) config.mvp.message = val }"
            />
          </div>
        </div>
      </div>
      <div class="flex-col">
        Supporter:
        <div class="flex flex-col space-y-2 w-full">
          <NInput
            :value="config && config.support && config.support.details" placeholder="supporter details" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
            @input="(val: string | undefined) => { if (config && config.support) config.support.details = val }"
          />
          <div class="flex space-x-2">
            <NInput
              :value="config && config.support && config.support.price" placeholder="supporter price"
              @input="(val: string | undefined) => { if (config && config.support) config.support.price = val }"
            />
            <NInput
              :value="config && config.support && config.support.message" placeholder="after buy message"
              @input="(val: string | undefined) => { if (config && config.support) config.support.message = val }"
            />
          </div>
        </div>
      </div>
      <div class="flex-col">
        Forum Link:
        <NInput
          :value="config && config.subURL" placeholder=""
          @input="(val: string | undefined) => { if (config) config.subURL = val }"
        />
      </div>
      <div class="flex-col">
        QR Code:
        <NInput
          :value="config && config.subImageLink" placeholder=""
          @input="(val: string | undefined) => { if (config) config.subImageLink = val }"
        />
      </div>
      <NButton :loading="saving" type="primary" @click="updatePrice()">
        {{ $t('common.save') }}
      </NButton>
    </div>
  </NSpin>
</template>
