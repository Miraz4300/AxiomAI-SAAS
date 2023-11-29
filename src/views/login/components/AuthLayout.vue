<script lang="ts" setup>
import { SvgIcon } from '@/components/common'
</script>

<template>
  <main class="w-screen h-screen flex items-center justify-center gap-8 dark:bg-slate-900">
    <div class="h-screen flex-1 flex flex-col items-center py-16 px-4">
      <p class="flex gap-2 font-logo text-slate-800 dark:text-slate-100 font-semibold text-5xl text-center">
        <SvgIcon style="width: 70px; height: 70px;" icon="ri:openai-fill" />
        <span class="flex py-2 items-center flex-col">
          AxiomAI
          <span class="font-light text-xs typewriter">powered by GPT</span>
        </span>
      </p>
      <div class="flex flex-col flex-1 w-full justify-center items-center">
        <slot />
      </div>
    </div>
    <div class="hidden lg:block h-screen flex-1 bg-sign-in-background dark:bg-sign-in-background-dark" />
  </main>
</template>

<style scoped>
.typewriter {
  overflow: hidden;
  border-right: 0.15em solid orange;
  white-space: nowrap;
  margin: 0 auto;
  letter-spacing: 0.12em;
  animation: typing 1.5s steps(29, end) forwards, blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
    border-right: none;
  }
}
</style>
