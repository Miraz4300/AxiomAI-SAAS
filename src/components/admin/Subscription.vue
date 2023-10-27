<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NInput, NSpin, NSwitch, useMessage } from 'naive-ui'
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
    // Create a default SubscriptionConfig if it doesn't exist
    const defaultConfig: SubscriptionConfig = {
      premium: { enabled: false, title: '', price: '', details: '', message: '' },
      mvp: { enabled: false, title: '', price: '', details: '', message: '' },
      support: { enabled: false, title: '', price: '', details: '', message: '' },
      enterprise: { enabled: false, title: '', price: '', details: '', message: '' },
      basic: { enabled: false, title: '', price: '', details: '', message: '' },
      basicPlus: { enabled: false, title: '', price: '', details: '', message: '' },
    }

    if (data.subscriptionConfig)
      config.value = { ...defaultConfig, ...data.subscriptionConfig }
    else
      config.value = defaultConfig

    // Save the updated SubscriptionConfig to the database
    await fetchUpdateSubscription(config.value)
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
        <NSwitch
          :round="false" :value="config && config.premium && config.premium.enabled"
          @update:value="(val: boolean | undefined) => { if (config && config.premium) config.premium.enabled = val }"
        />
        <div class="flex flex-col space-y-2 w-full">
          <NInput
            :value="config && config.premium && config.premium.details" placeholder="premium details" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
            @input="(val: string | undefined) => { if (config && config.premium) config.premium.details = val }"
          />
          <div class="flex space-x-2">
            <NInput
              :value="config && config.premium && config.premium.title" placeholder="premium title"
              @input="(val: string | undefined) => { if (config && config.premium) config.premium.title = val }"
            />
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
        <NSwitch
          :round="false" :value="config && config.mvp && config.mvp.enabled"
          @update:value="(val: boolean | undefined) => { if (config && config.mvp) config.mvp.enabled = val }"
        />
        <div class="flex flex-col space-y-2 w-full">
          <NInput
            :value="config && config.mvp && config.mvp.details" placeholder="mvp details" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
            @input="(val: string | undefined) => { if (config && config.mvp) config.mvp.details = val }"
          />
          <div class="flex space-x-2">
            <NInput
              :value="config && config.mvp && config.mvp.title" placeholder="mvp title"
              @input="(val: string | undefined) => { if (config && config.mvp) config.mvp.title = val }"
            />
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
        <NSwitch
          :round="false" :value="config && config.support && config.support.enabled"
          @update:value="(val: boolean | undefined) => { if (config && config.support) config.support.enabled = val }"
        />
        <div class="flex flex-col space-y-2 w-full">
          <NInput
            :value="config && config.support && config.support.details" placeholder="supporter details" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
            @input="(val: string | undefined) => { if (config && config.support) config.support.details = val }"
          />
          <div class="flex space-x-2">
            <NInput
              :value="config && config.support && config.support.title" placeholder="supporter title"
              @input="(val: string | undefined) => { if (config && config.support) config.support.title = val }"
            />
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
        Enterprise:
        <NSwitch
          :round="false" :value="config && config.enterprise && config.enterprise.enabled"
          @update:value="(val: boolean | undefined) => { if (config && config.enterprise) config.enterprise.enabled = val }"
        />
        <div class="flex flex-col space-y-2 w-full">
          <NInput
            :value="config && config.enterprise && config.enterprise.details" placeholder="enterprise details" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
            @input="(val: string | undefined) => { if (config && config.enterprise) config.enterprise.details = val }"
          />
          <div class="flex space-x-2">
            <NInput
              :value="config && config.enterprise && config.enterprise.title" placeholder="enterprise title"
              @input="(val: string | undefined) => { if (config && config.enterprise) config.enterprise.title = val }"
            />
            <NInput
              :value="config && config.enterprise && config.enterprise.price" placeholder="enterprise price"
              @input="(val: string | undefined) => { if (config && config.enterprise) config.enterprise.price = val }"
            />
            <NInput
              :value="config && config.enterprise && config.enterprise.message" placeholder="after buy message"
              @input="(val: string | undefined) => { if (config && config.enterprise) config.enterprise.message = val }"
            />
          </div>
        </div>
      </div>
      <div class="flex-col">
        Basic:
        <NSwitch
          :round="false" :value="config && config.basic && config.basic.enabled"
          @update:value="(val: boolean | undefined) => { if (config && config.basic) config.basic.enabled = val }"
        />
        <div class="flex flex-col space-y-2 w-full">
          <NInput
            :value="config && config.basic && config.basic.details" placeholder="basic details" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
            @input="(val: string | undefined) => { if (config && config.basic) config.basic.details = val }"
          />
          <div class="flex space-x-2">
            <NInput
              :value="config && config.basic && config.basic.title" placeholder="basic title"
              @input="(val: string | undefined) => { if (config && config.basic) config.basic.title = val }"
            />
            <NInput
              :value="config && config.basic && config.basic.price" placeholder="basic price"
              @input="(val: string | undefined) => { if (config && config.basic) config.basic.price = val }"
            />
            <NInput
              :value="config && config.basic && config.basic.message" placeholder="after buy message"
              @input="(val: string | undefined) => { if (config && config.basic) config.basic.message = val }"
            />
          </div>
        </div>
      </div>
      <div class="flex-col">
        BasicPlus:
        <NSwitch
          :round="false" :value="config && config.basicPlus && config.basicPlus.enabled"
          @update:value="(val: boolean | undefined) => { if (config && config.basicPlus) config.basicPlus.enabled = val }"
        />
        <div class="flex flex-col space-y-2 w-full">
          <NInput
            :value="config && config.basicPlus && config.basicPlus.details" placeholder="basic+ details" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
            @input="(val: string | undefined) => { if (config && config.basicPlus) config.basicPlus.details = val }"
          />
          <div class="flex space-x-2">
            <NInput
              :value="config && config.basicPlus && config.basicPlus.title" placeholder="basic+ title"
              @input="(val: string | undefined) => { if (config && config.basicPlus) config.basicPlus.title = val }"
            />
            <NInput
              :value="config && config.basicPlus && config.basicPlus.price" placeholder="basic+ price"
              @input="(val: string | undefined) => { if (config && config.basicPlus) config.basicPlus.price = val }"
            />
            <NInput
              :value="config && config.basicPlus && config.basicPlus.message" placeholder="after buy message"
              @input="(val: string | undefined) => { if (config && config.basicPlus) config.basicPlus.message = val }"
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
