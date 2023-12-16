<script setup lang='ts'>
import { computed, useAttrs } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  icon?: string
}

const props = defineProps<Props>()

const attrs = useAttrs()

const bindAttrs = computed<{ class: string; style: string }>(() => ({
  class: (attrs.class as string) || '',
  style: (attrs.style as string) || '',
}))

const iconValue = computed(() => {
  return props.icon ?? 'mdi:crosshairs-question'
})
</script>

<template>
  <Icon :icon="iconValue" v-bind="bindAttrs" />
</template>
