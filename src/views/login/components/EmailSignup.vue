<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NDivider, NInput, NModal, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { fetchRegister } from '@/api'
import { SvgIcon } from '@/components/common'

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
const showModal = ref(false)
const successMessage = ref('')

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
</script>

<template>
  <NDivider class="my-2">
    <span class="text-slate-600 dark:text-slate-200 font-semibold">
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
        class="mb-4"
        :status="confirmPasswordStatus"
      />
    </NInputGroup>
    <NButton block type="primary" :disabled="disabled || password !== confirmPassword" :loading="loading" @click="handleRegister">
      Signup
    </NButton>
  </div>
  <NModal v-model:show="showModal" :mask-closable="false">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <SvgIcon class="m-auto" style="width: 100px; height: 100px;" icon="mdi:email-check-outline" />
          <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
            Verification email sent
          </h2>
          <p class="text-base text-center">
            {{ successMessage }}
          </p>
          <p class="text-sm text-center text-slate-500 dark:text-slate-500">
            if you don't receive the email, please wait at least one or two minutes.
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
