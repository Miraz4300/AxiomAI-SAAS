<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store'

const greetingText = computed(() => {
  const firstName = useUserStore().userInfo.name.split(' ')[0]
  return firstName.includes('@') ? 'I\'m AxiomAI,' : `Hello, ${firstName}`
})
</script>

<template>
  <div class="flex flex-col text-4xl md:text-5xl font-semibold antialiased">
    <div class="animate-in fade-in slide-in-from-left-1.5 duration-300 ease-in">
      <a class="inline-block text-transparent bg-clip-text bg-[linear-gradient(to_right,theme(colors.blue.600),theme(colors.green.600),theme(colors.blue.600))] bg-[length:200%_auto] animate-gradient">
        {{ greetingText }}
      </a>
    </div>
    <a class="text-[#C4C7C5] dark:text-[#303A49] animate-in fade-in delay-300 duration-500 fill-mode-backwards ease-in">
      How can I help you today?
    </a>
  </div>
</template>
