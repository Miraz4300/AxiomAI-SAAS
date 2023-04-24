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
        404
      </h1>
      <div>
        <h2 class="text-sm font-normal leading-1">
          This page could not be found.
        </h2>
      </div>
    </div>
    <br>
    <br>
    <NButton type="primary" ghost @click="goHome">
      Back to Home
    </NButton>
  </div>
</template>
