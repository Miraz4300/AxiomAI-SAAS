<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NDivider, NInput, useMessage } from 'naive-ui'
import { authErrorType, authInfoType } from '../components/authEnum'
import { fetchResetPassword, fetchSendResetMail } from '@/api'

const route = useRoute()
const router = useRouter()

const ms = useMessage()
const loading = ref(false)
const username = ref('')
const password = ref('')
const sign = ref('')

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
    if (result.message === authInfoType.SRPM)
      router.push({ name: 'Info', query: { code: result.message } })
  }
  catch (error: any) {
    if (error.errorCode === authErrorType.NOTFOUND || error.errorCode === authErrorType.UNVERIFIED || error.errorCode === authErrorType.ABNORMAL)
      router.push({ name: 'Error', query: { code: error.errorCode } })
    else
      ms.error(error.message ?? 'An unexpected error occurred')
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
    if (result.message === authInfoType.PRSC)
      router.push({ name: 'Info', query: { code: result.message } })
  }
  catch (error: any) {
    ms.error(error.message ?? 'An unexpected error occurred')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <NDivider class="my-2">
    <span class="text-black dark:text-white font-semibold">
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
</template>
