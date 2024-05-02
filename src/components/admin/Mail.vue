<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NInput, NSelect, NSpin, NSwitch, useMessage } from 'naive-ui'
import type { ConfigState, MailConfig } from './model'
import { fetchChatConfig, fetchTestMail, fetchUpdateMail } from '@/api'

const ms = useMessage()

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)

const config = ref<MailConfig>()
const services = ['Mailgun', 'Mailtrap', 'Office365', 'Custom'].map(service => ({ label: service, value: service }))

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data.mailConfig
  }
  finally {
    loading.value = false
  }
}

async function updateMailInfo() {
  saving.value = true
  try {
    const { data } = await fetchUpdateMail(config.value as MailConfig)
    config.value = data
    ms.success('Saved Successfully')
  }
  catch (error: any) {
    ms.error(error.message)
  }
  saving.value = false
}

async function testMail() {
  testing.value = true
  try {
    const { message } = await fetchTestMail(config.value as MailConfig) as { status: string; message: string }
    ms.success(message, { keepAliveOnHover: true })
  }
  catch (error: any) {
    ms.error(error.message, { keepAliveOnHover: true })
  }
  testing.value = false
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-6 min-h-[200px]">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Service</span>
        <div class="flex-1">
          <NSelect
            :options="services"
            :value="config && config.service"
            style="width: 100%; max-width: 720px"
            @update:value="(val: string | undefined) => { if (config) config.service = val }"
          />
        </div>
      </div>
      <div v-if="config?.service === 'Custom'" class="space-y-6">
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">SMTP Host</span>
          <div class="flex-1">
            <NInput
              :value="config && config.smtpHost" placeholder="smtp hostname" style="width: 100%; max-width: 720px"
              @input="(val: string | undefined) => { if (config) config.smtpHost = val }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">SMTP Port</span>
          <div class="flex-1">
            <NInput
              :value="config && config.smtpPort !== undefined ? String(config.smtpPort) : undefined"
              placeholder="SMTP port number" style="width: 100%; max-width: 720px"
              @input="(val: any) => { if (config) config.smtpPort = typeof val === 'string' ? Number(val) : undefined }"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">TLS</span>
          <div class="flex-1">
            <NSwitch
              :round="false"
              :value="config && config.smtpTsl"
              @update:value="(val: boolean | undefined) => { if (config) config.smtpTsl = val }"
            />
          </div>
        </div>
        <div v-if="config?.smtpTsl" class="space-y-6">
          <div class="flex items-center space-x-4">
            <span class="flex-shrink-0 w-[100px]">TLS Ciphers</span>
            <div class="flex-1">
              <NInput
                :value="config && config.tls && config.tls.ciphers"
                placeholder="tls ciphers name"
                style="width: 100%; max-width: 720px"
                @update:value="(val: string) => { if (config && config.tls) config.tls.ciphers = val }"
              />
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="flex-shrink-0 w-[100px]">TLS Reject Unauthorized</span>
            <div class="flex-1">
              <NSwitch
                :round="false"
                :value="config && config.tls && config.tls.rejectUnauthorized"
                @update:value="(val: boolean) => { if (config && config.tls) config.tls.rejectUnauthorized = val }"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Sender Email</span>
        <div class="flex-1">
          <NInput
            :value="config && config.smtpSenderEmail" placeholder="optional" style="width: 100%; max-width: 720px"
            @input="(val: string | undefined) => { if (config) config.smtpSenderEmail = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Username</span>
        <div class="flex-1">
          <NInput
            :value="config && config.smtpUserName" placeholder="smtp username" style="width: 100%; max-width: 720px"
            @input="(val: string | undefined) => { if (config) config.smtpUserName = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Password</span>
        <div class="flex-1">
          <NInput
            :value="config && config.smtpPassword" placeholder="smtp password" style="width: 100%; max-width: 720px"
            @input="(val: string | undefined) => { if (config) config.smtpPassword = val }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]" />
        <div class="flex flex-wrap items-center gap-4">
          <NButton :loading="saving" type="primary" @click="updateMailInfo()">
            {{ $t('common.save') }}
          </NButton>
          <NButton :loading="testing" type="info" @click="testMail()">
            {{ $t('common.test') }}
          </NButton>
        </div>
      </div>
    </div>
  </NSpin>
</template>
