<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex h-full dark:bg-neutral-800">
    <div class="px-4 m-auto space-y-4 text-center max-[400px]">
      <h1 class="text-4xl text-slate-800 dark:text-neutral-200">
        Error Code: 404 Not Found
      </h1>
      <p class="text-base text-slate-500 dark:text-neutral-400">
        We're sorry, but the page you're looking for no longer exists.
      </p>
      <div class="flex items-center justify-center text-center">
        <div class="w-[300px]">
          <img src="../../../icons/404.svg" alt="404">
        </div>
      </div>
      <NButton type="primary" @click="goHome">
        Back to Home
      </NButton>
    </div>
  </div>
</template>
