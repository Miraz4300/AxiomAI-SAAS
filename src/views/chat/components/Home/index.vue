<script setup lang='ts'>
import Greeting from './greeting.vue'
import Prompt from './prompt.vue'

const props = defineProps(['randomPrompt'])
const emit = defineEmits(['fillTextarea'])

const fillTextarea = (value: any) => {
  emit('fillTextarea', value)
}
</script>

<template>
  <div class="gap-20 w-full md:max-w-2xl lg:max-w-5xl md:h-full md:flex md:flex-col select-none">
    <Greeting />
    <div class="flex gap-3 animate-in fade-in delay-300 duration-500 fill-mode-backwards ease-in">
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
