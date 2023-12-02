<script setup lang='ts'>
import BrandLogo from './BrandLogo.vue'
</script>

<template>
  <div class="flex min-h-full w-screen flex-col sm:supports-[min-height:100dvh]:min-h-[100dvh] md:grid md:grid-cols-2 lg:grid-cols-[50%_50%]">
    <div class="relative hidden flex-1 flex-col justify-center px-5 pt-8 md:flex md:px-6 md:py-[22px] lg:px-8 dark:bg-black bg-slate-800">
      <div class="relative flex w-full grow flex-col items-center justify-center">
        <BrandLogo :extra-text="true" />
      </div>
    </div>
    <div class="relative flex grow flex-col items-center justify-between px-5 py-8 md:px-6 bg-white dark:bg-[#00002E]">
      <div class="relative flex w-full grow flex-col items-center justify-center">
        <slot />
      </div>
      <div class="mt-10 flex flex-col justify-center items-center">
        <BrandLogo image-height="24px" image-width="24px" text-color="black" text-size="lg" gap-between="1" :extra-text="false" />
        <a class="py-2 text-xs text-black dark:text-gray-500">AxiomAI © 2023 | Deepspacelab Corp.</a>
      </div>
    </div>
  </div>
</template>
