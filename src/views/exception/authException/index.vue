<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'
import { NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { authErrorType, authInfoType } from '../../login/components/authEnum'
import { SvgIcon } from '@/components/common'

const route = useRoute()
const router = useRouter()
const code = route.query.code as string || 'UNKNOWN_ERROR_CODE_CHANNEL_AE'

const isError = Object.values(authErrorType).includes(code as any)
const hasIcon = Object.values(authInfoType).includes(code as any)

const messages: Record<string, string> = {
  // Error messages
  [authErrorType.ABNORMAL]: 'The singularity powering your account has temporarily shut down. To reignite your online presence, contact our support team for resolution at support@axiomaibd.com.',
  [authErrorType.PERMISSION]: 'Permission denied! Your account requires interstellar authorization. Please contact the admin to grant the necessary clearance for activation.',
  [authErrorType.UNVERIFIED]: 'Cosmic clearance requires! Verify your email address first to obtain the necessary permissions for account activation and navigate to the cosmic constellations.',
  [authErrorType.NOTFOUND]: 'Your presence is ghostly. Register your coordinates to become a visible star in our galactic database.',
  [authErrorType.USDV]: 'Account has been blocked. Please contact the admin to resolve the issue.',
  // Success messages
  [authInfoType.AASV]: 'The administrative account has been activated!',
  [authInfoType.SRPM]: 'Please check your email address for instructions to reset your password.',
  [authInfoType.PRSC]: 'The password reset process has been completed successfully.',
  [authInfoType.VERIFIED]: 'Your email has been successfully verified. Please login to your account.',
  [authInfoType.UNVERIFIED]: 'A verification email has been sent to your email address. Please check your inbox!',
  [authInfoType.UNVERIFIED2]: 'A verification email has already been sent to your email address! Please check your inbox!',
  [authInfoType.PERMISSION]: 'Verification successful, Please wait for the admin to activate your account.',
  [authInfoType.PERMISSION2]: 'Please wait for the admin to activate your account.',
}

const icons: Record<string, string> = {
  [authInfoType.AASV]: 'mdi:cog-outline',
  [authInfoType.SRPM]: 'fluent:password-20-regular',
  [authInfoType.PRSC]: 'iconoir:password-pass',
  [authInfoType.VERIFIED]: 'ri:verified-badge-line',
  [authInfoType.UNVERIFIED]: 'mdi:email-check-outline',
  [authInfoType.UNVERIFIED2]: 'mdi:email-check-outline',
  [authInfoType.PERMISSION]: 'tabler:lock-check',
  [authInfoType.PERMISSION2]: 'tabler:lock-pause',
}

const message = messages[code] || 'UNKNOWN_ERROR_MESSAGE_CHANNEL_AE'
const icon = icons[code] || 'mdi:alert-circle-outline'
const TOS = defineAsyncComponent(() => import('../../login/components/TOS.vue'))
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center bg-[var(--pbc)] dark:bg-[var(--pbc)] text-black dark:text-white">
    <div class="w-96 flex flex-col flex-auto justify-center items-center">
      <div v-if="isError" class="mb-5 bg-brand-logo bg-contain w-[41px] h-[41px]" draggable="false" />
      <div v-if="isError" class="mb-2 text-center text-lg">
        Oops!
      </div>
      <div class="mb-4 text-center" :class="{ 'text-xl': !isError }">
        <SvgIcon v-if="hasIcon" class="m-auto mb-4 w-[150px] h-[150px]" :icon="icon" />
        <p>{{ message }}</p>
      </div>
      <p class="mb-5 text-center">
        {{ isError ? 'Error' : 'Status' }} code: {{ code }}
      </p>
      <NButton ghost type="default" @click="router.replace('/')">
        {{ isError ? 'Go back' : 'Back to login' }}
      </NButton>
    </div>
    <TOS :footer="true" :modal="true" />
  </div>
</template>
