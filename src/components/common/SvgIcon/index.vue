<script setup lang='ts'>
import { computed, useAttrs } from 'vue'
import type { IconifyIcon } from '@iconify/vue'
import { Icon } from '@iconify/vue'

interface Props {
  icon: string | IconifyIcon
}

defineProps<Props>()

const attrs = useAttrs()

const bindAttrs = computed<{ class: string; style: string }>(() => ({
  class: (attrs.class as string) || '',
  style: (attrs.style as string) || '',
}))
</script>

<template>
  <Icon :icon="icon" v-bind="bindAttrs" />
</template>
