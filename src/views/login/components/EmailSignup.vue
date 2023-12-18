<script setup lang='ts'>
import { computed, defineAsyncComponent, ref } from 'vue'
import { NButton, NCheckbox, NDivider, NInput, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { authErrorType, authInfoType } from '../components/authEnum'
import { fetchRegister } from '@/api'

const router = useRouter()

const ms = useMessage()

const loading = ref(false)
const username = ref('')
const password = ref('')

const disabled = computed(() => !username.value.trim() || !password.value.trim() || loading.value)

const showConfirmPassword = ref(false)
const confirmPassword = ref('')
const agreed = ref(false)

function handlePasswordInput() {
  showConfirmPassword.value = password.value.trim() !== ''
}

const confirmPasswordStatus = computed(() => {
  if (!password.value || !confirmPassword.value)
    return undefined
  return password.value !== confirmPassword.value ? 'error' : 'success'
})

async function handleRegister() {
  const name = username.value.trim()
  const pwd = password.value.trim()
  const confirmPwd = confirmPassword.value.trim()

  if (!name || !pwd || !confirmPwd || pwd !== confirmPwd) {
    ms.error('Passwords don\'t match')
    return
  }

  try {
    loading.value = true
    const result = await fetchRegister(name, pwd)
    if (result.message === authInfoType.UNVERIFIED || result.message === authInfoType.UNVERIFIED2 || result.message === authInfoType.AASV)
      router.replace({ name: 'Exception', query: { code: result.message } })
  }
  catch (error: any) {
    if (error.errorCode === authErrorType.PERMISSION)
      router.replace({ name: 'Exception', query: { code: error.errorCode } })
    else
      ms.error(error.message ?? 'An unexpected error occurred')
  }
  finally {
    loading.value = false
  }
}

const TOS = defineAsyncComponent(() => import('./TOS.vue'))
</script>

<template>
  <NDivider class="my-2">
    <span class="text-black dark:text-white font-semibold">
      Signup
    </span>
  </NDivider>
  <div class="flex flex-col gap-2">
    <NInputGroup>
      <NInput v-model:value="username" type="text" placeholder="Email" class="mb-2" />
      <NInput v-model:value="password" type="password" placeholder="Password" class="mb-2" @input="handlePasswordInput" />
      <NInput
        v-if="showConfirmPassword"
        v-model:value="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        class="mb-2"
        :status="confirmPasswordStatus"
      />
      <NCheckbox v-model:checked="agreed" size="small" class="mb-4">
        <span class="text-black dark:text-white">
          I acknowledge and agree to the
          <TOS :span="true" :modal="true" />
        </span>
      </NCheckbox>
    </NInputGroup>
    <NButton block type="primary" :disabled="disabled || password !== confirmPassword || !agreed" :loading="loading" @click="handleRegister">
      Signup
    </NButton>
  </div>
</template>
