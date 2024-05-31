<script setup lang='ts'>
import { computed } from 'vue'
import { SvgIcon } from '@/components/common'

const props = defineProps({
  promptText: String,
  promptType: String,
})

const iconMap: Record<string, string> = {
  idea: 'carbon:idea',
  knowledge: 'tabler:brain',
  text: 'majesticons:edit-pen-4-line',
  food: 'mdi:food-italian',
  code: 'ic:round-code',
  movie: 'ri:movie-2-line',
  travel: 'mdi:wallet-travel',
  map: 'ic:outline-map',
  compare: 'ic:outline-balance',
}

const icon = computed(() => iconMap[props.promptType || ''] || 'mdi:arrow-right-thin')
</script>

<template>
  <div class="relative group">
    <div class="absolute inset-0 min-[768px]:bg-gradient-to-bl from-blue-600 to-green-500 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
    <div class="relative w-[12.5rem] h-[10rem] bg-[#F0F4F9] dark:bg-[#161B22] p-4 rounded-xl duration-1000 hover:bg-[#DDE3EA] dark:hover:bg-[#303A49] cursor-pointer antialiased">
      <div class="flex flex-col justify-between h-full">
        <div class="text-sm">
          {{ props.promptText }}
        </div>
        <div class="bg-white dark:bg-[#1F2630] rounded-full p-2 text-2xl self-end hover:bg-transparent">
          <SvgIcon :icon="icon" />
        </div>
      </div>
    </div>
  </div>
</template>
