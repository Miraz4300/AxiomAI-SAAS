<script setup lang='ts'>
import Greeting from './greeting.vue'
import Prompt from './prompt.vue'

const props = defineProps(['randomPrompt'])
const emit = defineEmits(['fillTextarea'])

function fillTextarea(value: any) {
  emit('fillTextarea', value)
}
</script>

<template>
  <div class="max-[640px]:p-2 w-full min-[768px]:max-w-fit select-none">
    <Greeting />
    <div class="mt-10 md:mt-20 flex gap-3 animate-in fade-in delay-300 duration-500 fill-mode-backwards ease-in overflow-x-auto min-[768px]:overflow-visible scrollbar-hide">
      <Prompt
        v-for="(item, index) in props.randomPrompt"
        :key="index"
        :prompt-text="item.key"
        :prompt-type="item.type"
        @click="fillTextarea(item.value)"
      />
    </div>
  </div>
</template>
