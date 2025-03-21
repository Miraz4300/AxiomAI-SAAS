<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NButton, NDivider, NInput } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { authErrorType, authInfoType } from '../components/authEnum'
import { fetchLogin, fetchVerify, fetchVerifyAdmin } from '@/api'
import { useAuthStore } from '@/store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const username = ref('')
const password = ref('')

const disabled = computed(() => !username.value.trim() || !password.value.trim() || loading.value)

onMounted(async () => {
  const verifytoken = route.query.verifytoken as string
  await handleVerify(verifytoken)
  const verifytokenadmin = route.query.verifytokenadmin as string
  await handleVerifyAdmin(verifytokenadmin)
})

async function handleVerify(verifytoken: string) {
  if (!verifytoken)
    return
  const secretKey = verifytoken.trim()

  try {
    loading.value = true
    const result = await fetchVerify(secretKey)
    if (result.message === authInfoType.VERIFIED || result.message === authInfoType.PERMISSION || result.message === authInfoType.PERMISSION2
    || result.message === authErrorType.USDV || result.message === authErrorType.ABNORMAL2 || result.message === authErrorType.BANNED)
      router.replace({ name: 'Exception', query: { code: result.message } })
    else
      window.$message?.success(result.message as string)
  }
  catch (error: any) {
    window.$message?.error(error.message ?? 'An unexpected error occurred')
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
    window.$message?.success('Activate successfully')
    router.replace('/')
  }
  catch (error: any) {
    window.$message?.error(error.message ?? 'An unexpected error occurred')
  }
  finally {
    loading.value = false
  }
}

function handlePress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleLogin()
  }
}

async function handleLogin() {
  const name = username.value.trim()
  const pwd = password.value.trim()

  if (!name || !pwd)
    return

  try {
    loading.value = true
    const result = await fetchLogin(name, pwd)
    if (result.data.needMFA) {
      authStore.setTempCredentials(name, pwd)
      router.replace({ name: 'MfaLogin' })
      return
    }
    await authStore.setToken(result.data.token)
    window.$message?.success(result.message as string)
    // Redirect to the originally requested page or home page if no redirect query parameter exists
    const redirect = route.query.redirect
    router.replace(redirect ? decodeURIComponent(redirect as string) : '/')
  }
  catch (error: any) {
    if (error.errorCode === authErrorType.UNVERIFIED || error.errorCode === authErrorType.ABNORMAL
    || error.errorCode === authErrorType.PERMISSION || error.errorCode === authErrorType.BANNED)
      router.replace({ name: 'Exception', query: { code: error.errorCode } })
    else
      window.$message?.error(error.message ?? 'An unexpected error occurred')
    password.value = ''
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <NDivider class="my-2">
    <span class="text-black dark:text-white font-semibold">
      Login
    </span>
  </NDivider>
  <div class="flex flex-col gap-2">
    <NInputGroup>
      <NInput v-model:value="username" type="text" placeholder="Email" class="mb-2" />
      <NInput v-model:value="password" type="password" placeholder="Password" show-password-on="mousedown" class="mb-2" @keypress="handlePress" />
    </NInputGroup>
    <NButton block type="primary" :disabled="disabled" :loading="loading" @click="handleLogin">
      Login
    </NButton>
  </div>
</template>
