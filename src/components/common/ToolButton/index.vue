<script setup lang='ts'>
import type { PopoverPlacement } from 'naive-ui'
import { NTooltip } from 'naive-ui'
import Button from './Button.vue'
import { useTheme } from '@/hooks/useTheme'

interface Props {
  tooltip?: string
  placement?: PopoverPlacement
}

interface Emit {
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  tooltip: '',
  placement: 'bottom',
})

const emit = defineEmits<Emit>()
const { naiveCustom } = useTheme()

function handleClick() {
  emit('click')
}
</script>

<template>
  <div v-if="props.tooltip">
    <NTooltip :placement="placement" :theme-overrides="naiveCustom.Border" trigger="hover">
      <template #trigger>
        <Button @click="handleClick">
          <slot />
        </Button>
      </template>
      {{ tooltip }}
    </NTooltip>
  </div>
  <div v-else>
    <Button @click="handleClick">
      <slot />
    </Button>
  </div>
</template>
