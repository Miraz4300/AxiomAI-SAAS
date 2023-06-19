<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NDivider, NInput, NModal, useMessage } from 'naive-ui'
import { fetchResetPassword, fetchSendResetMail } from '@/api'
import { SvgIcon } from '@/components/common'

const route = useRoute()
const router = useRouter()

function goHome() {
  router.push('/')
  setTimeout(() => {
    location.reload()
  }, 1000)
}

const ms = useMessage()
const loading = ref(false)
const username = ref('')
const password = ref('')
const sign = ref('')
const showModal = ref(false)
const successMessage = ref('')
const successResetPassMessage = ref('')

const getIcon = computed(() => {
  return successMessage.value ? 'fluent:password-20-regular' : 'iconoir:password-pass'
})

const disabled = computed(() => !username.value.trim() || !password.value.trim() || loading.value)

const showConfirmPassword = ref(false)
const confirmPassword = ref('')

function handlePasswordInput() {
  showConfirmPassword.value = password.value.trim() !== ''
}

const confirmPasswordStatus = computed(() => {
  if (!password.value || !confirmPassword.value)
    return undefined
  return password.value !== confirmPassword.value ? 'error' : 'success'
})

onMounted(async () => {
  sign.value = route.query.verifyresetpassword as string
  if (sign.value)
    username.value = sign.value.split('-')[0].split('|')[0]
})

async function handleSendResetMail() {
  const name = username.value.trim()

  if (!name)
    return

  try {
    loading.value = true
    const result = await fetchSendResetMail(name)
    successMessage.value = result.message as string
    showModal.value = true
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
  }
  finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  const name = username.value.trim()
  const pwd = password.value.trim()
  const confirmPwd = confirmPassword.value.trim()

  if (!name || !pwd || !confirmPwd || pwd !== confirmPwd) {
    ms.error('Passwords don\'t match')
    return
  }

  try {
    loading.value = true
    const result = await fetchResetPassword(name, pwd, sign.value)
    successResetPassMessage.value = result.message as string
    showModal.value = true
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <NDivider class="my-2">
    <span class="text-slate-600 dark:text-slate-200 font-semibold">
      Reset password
    </span>
  </NDivider>
  <div class="flex flex-col gap-2">
    <NInputGroup>
      <NInput v-model:value="username" :disabled="sign !== undefined" type="text" placeholder="Email" class="mb-2" />
      <NInput v-if="!!sign" v-model:value="password" type="password" placeholder="Password" class="mb-2" @input="handlePasswordInput" />
      <NInput
        v-if="showConfirmPassword"
        v-model:value="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        class="mb-4"
        :status="confirmPasswordStatus"
      />
    </NInputGroup>
    <NButton v-if="!sign" block type="primary" :disabled="username.length <= 0" :loading="loading" @click="handleSendResetMail">
      Submit
    </NButton>
    <NButton v-else block type="primary" :disabled="disabled || password !== confirmPassword" :loading="loading" @click="handleResetPassword">
      Reset password
    </NButton>
  </div>
  <NModal v-model:show="showModal" :mask-closable="false">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <SvgIcon class="m-auto" style="width: 100px; height: 100px;" :icon="getIcon" />
          <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
            {{ successMessage ? 'Password reset email sent' : 'Password successfully changed' }}
          </h2>
          <p class="text-base text-center">
            {{ successMessage || successResetPassMessage }}
          </p>
          <p class="text-sm text-center text-slate-500 dark:text-slate-500">
            {{ successMessage ? 'if you don\'t receive the email, please wait at least one or two minutes.' : 'now you can login by clicking the button below' }}
          </p>
        </header>
        <br>
        <NButton text type="primary" ghost @click="goHome">
          ← Back to Login
        </NButton>
      </div>
    </div>
  </NModal>
</template>
