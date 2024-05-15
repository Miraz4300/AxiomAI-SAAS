<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NInput, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import TOS from './TOS.vue'
import { fetchLogin } from '@/api'
import { useAuthStore } from '@/store'
import { SvgIcon } from '@/components/common'

const ms = useMessage()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const token = ref('')
const errorMessage = ref<string | null>('')

const disabled = computed(() => !token.value.trim() || loading.value)

async function handle2FASubmit() {
  loading.value = true
  try {
    if (!authStore.tuc)
      throw new Error('Temporary credentials not found')

    const username = authStore.tuc.username
    const password = authStore.tuc.password
    const result = await fetchLogin(username, password, token.value)
    if (result.status === 'Success') {
      await authStore.setToken(result.data.token)
      authStore.clearTempCredentials()
      ms.success(result.message as string)
      router.replace('/')
    }
    else {
      errorMessage.value = result.message
    }
  }
  catch (error) {
    errorMessage.value = (error as Error).message
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full w-screen flex-col sm:supports-[min-height:100dvh]:min-h-[100dvh] md:grid md:grid-cols-2 lg:grid-cols-[20%_80%]">
    <div class="relative hidden justify-center md:flex bg-black">
      <div class="flex flex-col gap-2 items-center justify-center select-none">
        <div class="bg-brand-logo bg-contain w-[50px] h-[50px]" draggable="false" />
        <p class="font-logo text-white font-semibold antialiased text-2xl text-center">
          AxiomAI
        </p>
      </div>
    </div>

    <div class="relative flex grow flex-col px-5 py-8 md:px-6 bg-[var(--pbc)] dark:bg-[var(--pbc)] text-black dark:text-white">
      <div class="relative flex grow flex-col p-8 max-[640px]:p-3 gap-7">
        <div class="flex flex-col gap-10 select-none">
          <span class="flex text-lg items-center space-x-2">
            <SvgIcon icon="mdi:shield-lock-outline" />
            <a> Multi-factor authentication </a>
          </span>
          <a class="text-3xl"> Verify Your Identity </a>
        </div>
        <div class="w-full md:w-[750px] flex flex-col gap-4 bg-white dark:bg-white/5 p-6 rounded-2xl shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
          <div class="flex flex-col gap-2">
            <a class="text-sm font-bold"> Authentication Method </a>
            <a class="w-full md:w-1/3 text-center bg-white dark:bg-white/5 p-2 rounded-md border border-neutral-300 dark:border-neutral-700"> Authenticator App </a>
          </div>
          <div class="w-full md:w-[600px] flex flex-col gap-2">
            <a class="text-sm"> Please enter the code displayed in your authenticator app. Then you'll be redirected.</a>
            <NInput v-model:value="token" maxlength="6" type="text" placeholder="Enter your authenticator app code" />
            <NButton ghost type="default" :disabled="disabled" :loading="loading" @click="handle2FASubmit">
              Verify
            </NButton>
            <p class="text-xs text-[#F59E0B]">
              {{ errorMessage }}
            </p>
            <p class="text-xs mb-4 mt-4">
              Need help? Contact us at <a href="mailto:support@axiomaibd.com" class="text-[var(--primary-color)]">support@axiomaibd.com</a>
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-center">
        <TOS :footer="true" :modal="true" />
      </div>
    </div>
  </div>
</template>
