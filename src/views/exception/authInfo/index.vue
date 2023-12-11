<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { authInfoType } from '../../login/components/authEnum'
import { SvgIcon } from '@/components/common'

const route = useRoute()
const router = useRouter()
const successCode = route.query.code

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center bg-[var(--pbc)] dark:bg-[var(--pbc)] text-black dark:text-white">
    <div class="w-96 flex flex-col flex-auto justify-center items-center">
      <div class="mb-4 text-center text-lg">
        <p v-if="successCode === authInfoType.AASV">
          The administrative account has been activated!
        </p>
        <p v-if="successCode === authInfoType.SRPM">
          <SvgIcon class="m-auto w-[150px] h-[150px]" icon="fluent:password-20-regular" />
          A link to reset your password has been sent to your email address!
        </p>
        <p v-if="successCode === authInfoType.PRSC">
          <SvgIcon class="m-auto w-[150px] h-[150px]" icon="iconoir:password-pass" />
          Your password has been reset successfully!
        </p>
        <p v-if="successCode === authInfoType.UNVERIFIED">
          <SvgIcon class="m-auto w-[150px] h-[150px]" icon="mdi:email-check-outline" />
          A verification email has been sent to your email address. Please check your inbox!
        </p>
        <p v-if="successCode === authInfoType.UNVERIFIED2">
          <SvgIcon class="m-auto w-[150px] h-[150px]" icon="mdi:email-check-outline" />
          A verification email has already been sent to your email address! Please check your inbox!
        </p>
        <p v-if="successCode === authInfoType.PERMISSION">
          Verification successful, Please wait for the admin to activate your account.
        </p>
        <p v-if="successCode === authInfoType.PERMISSION2">
          Please wait for the admin to activate your account.
        </p>
      </div>
      <p class="mb-5 text-center">
        Status code: {{ successCode }}
      </p>
      <NButton ghost type="default" @click="goHome">
        Back to login
      </NButton>
    </div>
    <a class="py-3 text-xs text-black dark:text-gray-500">AxiomAI © 2023 | Deepspacelab</a>
  </div>
</template>
