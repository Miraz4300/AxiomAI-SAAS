<script setup lang='ts'>
import { NTooltip } from 'naive-ui'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import Button from './Button.vue'
import { useAppStore } from '@/store'
import { SvgIcon } from '@/components/common'

interface Props {
  tooltip?: string
  route?: string
  appStoreFlag?: string
  icon: string
}

interface Emit {
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  tooltip: '',
  route: '',
  appStoreFlag: '',
  icon: '',
})

const emit = defineEmits<Emit>()
const router = useRouter()
const appStore = useAppStore()

const isActive = computed(() => {
  return router.currentRoute.value.path.startsWith(props.route)
})

const isEnabled = computed(() => {
  if (props.appStoreFlag)
    return appStore[props.appStoreFlag]
  return true
})

function handleClick() {
  emit('click')
  if (props.route && !router.currentRoute.value.path.startsWith(props.route))
    router.replace(props.route)
}
</script>

<template>
  <div v-if="isEnabled && props.tooltip" class="flex w-full flex-col justify-center">
    <NTooltip v-if="props.tooltip" placement="right" trigger="hover">
      <template #trigger>
        <Button @click="handleClick">
          <SvgIcon class="inline-block text-2xl transition hover:scale-110 hover:text-[var(--primary-color-hover)] hover:dark:text-[var(--primary-color-hover)]" :class="[isActive ? `text-[var(--primary-color)]` : 'text-slate-500 dark:text-[#fafafa]']" :icon="props.icon" />
        </Button>
      </template>
      {{ tooltip }}
    </NTooltip>
    <Button v-else @click="handleClick">
      <SvgIcon class="inline-block text-2xl transition hover:scale-110 hover:text-[var(--primary-color-hover)] hover:dark:text-[var(--primary-color-hover)]" :class="[isActive ? `text-[var(--primary-color)]` : 'text-slate-500 dark:text-[#fafafa]']" :icon="props.icon" />
    </Button>
  </div>
</template>
