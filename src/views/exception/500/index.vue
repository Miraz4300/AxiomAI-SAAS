<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen text-center bg-[#D1D1D1] dark:bg-[#202020] text-black dark:text-white">
    <div class="flex items-center">
      <h1 class="mr-5 pr-5 border-r-2 border-black dark:border-gray-500 h-14 text-2xl font-medium pt-2.5">
        500
      </h1>
      <div>
        <h2 class="text-sm font-normal leading-1">
          Internal server error.
        </h2>
      </div>
    </div>
    <br>
    <p class="text-base text-center text-slate-500 dark:text-gray-500">
      Don't worry, we're working to resolve the issue as quickly as possible.<br>
      you can check the realtime server status <a class="text-blue-600 dark:text-blue-500" href="https://axiomai.statuspage.io" target="_blank">here</a>
    </p>
    <br>
    <NButton type="primary" ghost @click="goHome">
      Back to Home
    </NButton>
  </div>
</template>
