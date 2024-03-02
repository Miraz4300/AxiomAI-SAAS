<script setup lang='ts'>
import { computed } from 'vue'
import { SvgIcon } from '@/components/common'

const props = defineProps({
  promptText: {
    type: String,
    default: 'loading',
  },
  promptType: {
    type: String,
    default: 'loading',
  },
})

const icon = computed(() => {
  switch (props.promptType) {
    case 'idea':
      return 'carbon:idea'
    case 'knowledge':
      return 'tabler:brain'
    case 'text':
      return 'majesticons:edit-pen-4-line'
    case 'food':
      return 'mdi:food-italian'
    case 'code':
      return 'ic:round-code'
    case 'movie':
      return 'ri:movie-2-line'
    default:
      return 'mdi:arrow-right-thin'
  }
})
</script>

<template>
  <div class="w-[12.5rem] h-[10rem] bg-[#F0F4F9] dark:bg-[#161B22] p-3 rounded-lg hover:bg-[#DDE3EA] dark:hover:bg-[#303A49] cursor-pointer">
    <div class="flex flex-col justify-between h-full">
      <div class="text-sm">
        {{ props.promptText }}
      </div>
      <div class="bg-white dark:bg-[#1F2630] rounded-full p-2 text-2xl self-end hover:bg-transparent">
        <SvgIcon :icon="icon" />
      </div>
    </div>
  </div>
</template>
