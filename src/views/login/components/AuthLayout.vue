<script lang="ts" setup>
import { SvgIcon } from '@/components/common'
</script>

<template>
  <main class="w-screen h-screen flex items-center justify-center gap-8 dark:bg-slate-900">
    <div class="h-screen flex-1 flex flex-col items-center py-16 px-4">
      <p class="flex gap-2 font-logo text-slate-500 dark:text-slate-200 font-semibold text-5xl text-center">
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
  overflow: hidden; /* Ensures the content is not visible outside the containing element */
  border-right: 0.15em solid orange; /* The typewriter cursor effect */
  white-space: nowrap; /* Keeps the text in a single line */
  margin: 0 auto; /* Centers the element */
  letter-spacing: 0.12em; /* Adjusts the spacing between letters */
  animation: typing 1.5s steps(29, end), blink-caret 0.75s step-end infinite; /* Animation properties */
}

@keyframes typing {
  from {
    width: 0; /* Starts with no width (hidden) */
  }
  to {
    width: 60%; /* Ends with full width (visible) */
  }
}

@keyframes blink-caret {
  from, to {
    border-color: transparent; /* Creates the blinking effect by toggling the border color */
  }
  50% {
    border-color: orange; /* Halfway through, the border color becomes visible */
  }
}
</style>
