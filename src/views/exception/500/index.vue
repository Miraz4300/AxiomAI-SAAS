<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.replace('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen text-center bg-[var(--pbc)] dark:bg-[var(--pbc)] text-black dark:text-white">
    <div class="flex items-center">
      <h1 class="mr-6 pr-5 border-r-2 border-gray-500 dark:border-gray-500 h-14 text-3xl font-medium pt-2.5">
        500
      </h1>
      <div>
        <h2 class="text-base font-medium leading-1">
          Black Hole Encounter
        </h2>
      </div>
    </div>
    <br>
    <p class="text-sm text-center text-gray-800 dark:text-gray-400">
      An unexpected error occurred. It's as mysterious as a black hole.<br>
      Our developers are working to bring back the light.
    </p>
    <br>
    <NButton ghost type="default" @click="goHome">
      Back to Home
    </NButton>
  </div>
</template>
