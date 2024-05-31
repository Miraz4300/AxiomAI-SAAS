<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NCheckbox, NDivider, NInput } from 'naive-ui'
import { useRouter } from 'vue-router'
import { authErrorType, authInfoType } from '../components/authEnum'
import TOS from './TOS.vue'
import { fetchRegister } from '@/api'

const router = useRouter()

const loading = ref(false)
const username = ref('')
const password = ref('')

const passwordIsValid = computed(() => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return regex.test(password.value)
})

const passwordError = computed(() => {
  const errors = []

  if (password.value.length < 8)
    errors.push('8 characters')

  if (!/[a-z]/.test(password.value))
    errors.push('one lowercase letter')

  if (!/[A-Z]/.test(password.value))
    errors.push('one uppercase letter')

  if (!/\d/.test(password.value))
    errors.push('one digit')

  return `Password must be ${errors.join(', ')}.`
})

const disabled = computed(() => !username.value.trim() || !passwordIsValid.value || loading.value)

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
    window.$message?.error('Passwords don\'t match')
    return
  }

  try {
    loading.value = true
    const result = await fetchRegister(name, pwd)
    if (result.message === authInfoType.UNVERIFIED || result.message === authInfoType.UNVERIFIED2 || result.message === authInfoType.AASV)
      router.replace({ name: 'Exception', query: { code: result.message } })
  }
  catch (error: any) {
    if (error.errorCode === authErrorType.PERMISSION || error.errorCode === authErrorType.BANNED)
      router.replace({ name: 'Exception', query: { code: error.errorCode } })
    else if (error.data.warn)
      window.$message?.warning(error.message, { duration: 5000, keepAliveOnHover: true })
    else
      window.$message?.error(error.message ?? 'An unexpected error occurred', { duration: 5000, keepAliveOnHover: true })
  }
  finally {
    loading.value = false
  }
}
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
      <NInput v-model:value="password" type="password" placeholder="Password" show-password-on="mousedown" class="mb-2" @input="handlePasswordInput" />
      <NInput
        v-if="showConfirmPassword"
        v-model:value="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        show-password-on="mousedown"
        class="mb-2"
        :status="confirmPasswordStatus"
      />
      <p v-if="!passwordIsValid" class="text-[#FB923C] dark:text-[#F59E0B] text-xs mb-4">
        {{ passwordError }}
      </p>
      <NCheckbox v-model:checked="agreed" size="small" class="mb-4">
        <span class="text-black dark:text-white">
          I acknowledge and agree to the
          <TOS :span="true" :modal="true" />
        </span>
      </NCheckbox>
    </NInputGroup>
    <NButton block type="primary" :disabled="disabled || password !== confirmPassword || !agreed || !passwordIsValid" :loading="loading" @click="handleRegister">
      Signup
    </NButton>
  </div>
</template>
