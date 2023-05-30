<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NDivider, NInput, useMessage } from 'naive-ui'
import { fetchResetPassword, fetchSendResetMail, fetchVerify, fetchVerifyAdmin } from '@/api'
import { useAuthStore } from '@/store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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
  const verifytoken = route.query.verifytoken as string
  await handleVerify(verifytoken)
  const verifytokenadmin = route.query.verifytokenadmin as string
  await handleVerifyAdmin(verifytokenadmin)
  sign.value = route.query.verifyresetpassword as string
  if (sign.value)
    username.value = sign.value.split('-')[0].split('|')[0]
})

async function handleVerify(verifytoken: string) {
  if (!verifytoken)
    return
  const secretKey = verifytoken.trim()

  try {
    loading.value = true
    const result = await fetchVerify(secretKey)
    ms.success(result.message as string)
    router.replace('/')
    setTimeout(() => {
      location.reload()
    }, 3000)
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
    authStore.removeToken()
  }
  finally {
    loading.value = false
  }
}

async function handleVerifyAdmin(verifytoken: string) {
  if (!verifytoken)
    return
  const secretKey = verifytoken.trim()

  try {
    loading.value = true
    await fetchVerifyAdmin(secretKey)
    ms.success('Activate successfully')
    router.replace('/')
    setTimeout(() => {
      location.reload()
    }, 3000)
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
  }
  finally {
    loading.value = false
  }
}

async function handleSendResetMail() {
  const name = username.value.trim()

  if (!name)
    return

  try {
    loading.value = true
    const result = await fetchSendResetMail(name)
    ms.success(result.message as string)
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
    ms.success(result.message as string)
    router.replace('/')
    setTimeout(() => {
      location.reload()
    }, 3000)
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
      {{ $t("common.resetPasswordBTN") }}
    </span>
  </NDivider>
  <div class="flex flex-col gap-2">
    <NInputGroup>
      <NInput v-model:value="username" :disabled="sign !== undefined" type="text" :placeholder="$t('common.email')" class="mb-2" />
      <NInput v-if="!!sign" v-model:value="password" type="password" :placeholder="$t('common.password')" class="mb-2" @input="handlePasswordInput" />
      <NInput
        v-if="showConfirmPassword"
        v-model:value="confirmPassword"
        type="password"
        :placeholder="$t('common.passwordConfirm')"
        class="mb-4"
        :status="confirmPasswordStatus"
      />
    </NInputGroup>
    <NButton v-if="!sign" block type="primary" :disabled="username.length <= 0" :loading="loading" @click="handleSendResetMail">
      {{ $t('common.resetPasswordMail') }}
    </NButton>
    <NButton v-else block type="primary" :disabled="disabled || password !== confirmPassword" :loading="loading" @click="handleResetPassword">
      {{ $t('common.resetPasswordBTN') }}
    </NButton>
  </div>
</template>
