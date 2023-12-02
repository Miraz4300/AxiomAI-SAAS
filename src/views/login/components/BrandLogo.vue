<script setup lang='ts'>
const props = defineProps({
  imageWidth: { type: String, default: '110px' },
  imageHeight: { type: String, default: '110px' },
  textColor: { type: String, default: 'white' },
  textSize: { type: String, default: '6xl' },
  gapBetween: { type: String, default: '4' },
  extraText: { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex items-center select-none" :class="`gap-${props.gapBetween}`">
    <img :style="{ width: props.imageWidth, height: props.imageHeight }" src="/favicon.png" alt="AxiomAI Logo" draggable="false">
    <p class="flex gap-2 font-logo dark:text-white font-semibold" :class="`text-${props.textSize} text-${props.textColor} text-center`">
      <span class="flex py-2 items-center flex-col">
        AxiomAI
        <span v-if="props.extraText" class="font-light text-sm typewriter">powered by GPT</span>
      </span>
    </p>
  </div>
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
