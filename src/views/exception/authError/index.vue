<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { authErrorType } from '../../login/components/authEnum'

const route = useRoute()
const router = useRouter()
const errorCode = route.query.code

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center bg-[var(--pbc)] dark:bg-[var(--pbc)] text-black dark:text-white">
    <div class="w-96 flex flex-col flex-auto justify-center items-center">
      <div class="mb-5 bg-brand-logo bg-contain w-[41px] h-[41px]" draggable="false" />
      <div class="mb-2 text-center text-lg">
        Oops!
      </div>
      <div class="mb-4 text-center">
        <p v-if="errorCode === authErrorType.ABNORMAL">
          The singularity powering your account has temporarily shut down. To reignite your online presence, contact our support team for resolution at support@axiomaibd.com.
        </p>
        <p v-if="errorCode === authErrorType.PERMISSION">
          Permission denied! Your account requires interstellar authorization. Please contact the admin to grant the necessary clearance for activation.
        </p>
        <p v-if="errorCode === authErrorType.UNVERIFIED">
          Cosmic clearance requires! Verify your email address first to obtain the necessary permissions for account activation and navigate to the cosmic constellations.
        </p>
        <p v-if="errorCode === authErrorType.NOTFOUND">
          Your presence is ghostly. Register your coordinates to become a visible star in our galactic database.
        </p>
        <p v-if="errorCode === authErrorType.USDV">
          Account has been blocked. Please contact the admin to resolve the issue.
        </p>
      </div>
      <p class="mb-5 text-center">
        Error code: {{ errorCode }}
      </p>
      <NButton ghost type="default" @click="goHome">
        Go back
      </NButton>
    </div>
    <a class="py-3 text-xs text-black dark:text-gray-500">AxiomAI © 2023 | Deepspacelab</a>
  </div>
</template>
