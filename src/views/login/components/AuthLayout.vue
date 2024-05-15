<script setup lang="ts">
import { NButton } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import EmailSignup from './EmailSignup.vue'
import EmailLogin from './EmailLogin.vue'
import ResetPassword from './ResetPassword.vue'
import TOS from './TOS.vue'

const route = useRoute()
const sign = ref('')
const currentTab = ref('emailLogin')

onMounted(async () => {
  sign.value = route.query.verifyresetpassword as string
  if (sign.value)
    currentTab.value = 'resetPassword'
})
</script>

<template>
  <div class="relative flex grow flex-col items-center justify-between px-5 py-8 md:px-6 bg-white dark:bg-[#00002E]">
    <div class="relative flex w-full grow flex-col items-center justify-center">
      <div class="px-4 rounded w-full max-w-lg">
        <p class="mb-8 text-center text-3xl md:text-[32px] font-medium text-black dark:text-white">
          Get started
        </p>
        <div class="flex flex-col gap-4">
          <p class="text-black dark:text-white text-base text-center">
            Unlock Infinite Potential with a simple sign-in or dive into boundless creativity by registering an account!
          </p>
          <EmailLogin v-if="currentTab === 'emailLogin'" />
          <EmailSignup v-else-if="currentTab === 'emailSignup'" />
          <ResetPassword v-else />
          <div class="w-full flex justify-between">
            <NButton v-show="currentTab === 'emailSignup' || currentTab === 'resetPassword'" quaternary size="small" type="primary" @click="currentTab = 'emailLogin'">
              ← Go back to login
            </NButton>
            <NButton v-show="currentTab !== 'emailSignup' && currentTab !== 'resetPassword'" quaternary size="small" type="primary" @click="currentTab = 'emailSignup'">
              Create account
            </NButton>
            <NButton v-show="currentTab !== 'resetPassword' && currentTab !== 'emailSignup'" quaternary size="small" type="primary" @click="currentTab = 'resetPassword'">
              Forgot password?
            </NButton>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-10 flex flex-col justify-center items-center">
      <div class="flex gap-1.5 items-center select-none">
        <div class="bg-brand-logo bg-contain w-[22px] h-[22px]" draggable="false" />
        <p class="flex font-logo text-black dark:text-white font-semibold antialiased text-lg text-center">
          <span class="flex py-2 items-center flex-col">
            AxiomAI
          </span>
        </p>
      </div>
      <TOS :footer="true" :modal="true" />
    </div>
  </div>
</template>
