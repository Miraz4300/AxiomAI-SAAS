<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen text-center bg-[var(--pbc)] dark:bg-[var(--pbc)] text-black dark:text-white">
    <div class="flex items-center">
      <h1 class="mr-6 pr-5 border-r-2 border-gray-500 dark:border-gray-500 h-14 text-3xl font-medium pt-2.5">
        404
      </h1>
      <div>
        <h2 class="text-base font-medium leading-1">
          This page could not be found.
        </h2>
      </div>
    </div>
    <br>
    <p class="text-sm text-center text-gray-800 dark:text-gray-400">
      Requested URL was not found on this server. Try double-check your speeling.
    </p>
    <br>
    <NButton type="primary" ghost @click="goHome">
      Back to Home
    </NButton>
  </div>
</template>
