<script setup lang='ts'>
interface Emit {
  (e: 'click'): void
}

const emit = defineEmits<Emit>()

function handleClick() {
  emit('click')
}
</script>

<template>
  <button
    class="h-12 w-12 shrink-0 cursor-pointer rounded-xl bg-white dark:bg-[#232B36]"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
