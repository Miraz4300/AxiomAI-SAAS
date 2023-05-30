<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NDivider, NInput, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { fetchLogin } from '@/api'
import { useAuthStore } from '@/store'

const ms = useMessage()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const username = ref('')
const password = ref('')

const disabled = computed(() => !username.value.trim() || !password.value.trim() || loading.value)

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
    await authStore.setToken(result.data.token)
    ms.success('logged in')
    router.replace('/')
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
    password.value = ''
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <NDivider class="my-2">
    <span class="text-slate-600 dark:text-slate-200 font-semibold">
      {{ $t("common.login") }}
    </span>
  </NDivider>
  <div class="flex flex-col gap-2">
    <NInputGroup>
      <NInput v-model:value="username" type="text" :placeholder="$t('common.email')" class="mb-2" />
      <NInput v-model:value="password" type="password" :placeholder="$t('common.password')" class="mb-2" @keypress="handlePress" />
    </NInputGroup>
    <NButton block type="primary" :disabled="disabled" :loading="loading" @click="handleLogin">
      {{ $t('common.login') }}
    </NButton>
  </div>
</template>
