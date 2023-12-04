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
    class="flex h-7 w-7 items-center justify-center rounded border transition p-1 hover:bg-[#eef0f3] dark:hover:bg-gray-700 border-neutral-300 dark:border-neutral-700"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
