<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAppStore } from '@/store'
import { SvgIcon } from '@/components/common'

interface Props {
  title: string
  icon: string
  route: string
  appStoreFlag?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  route: '',
  appStoreFlag: '',
})
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
  if (props.route && !router.currentRoute.value.path.startsWith(props.route))
    router.replace(props.route)
}
</script>

<template>
  <a v-if="isEnabled" class="leading-4 text-center cursor-pointer" :class="[isActive ? `text-[var(--primary-color)]` : 'text-slate-500 dark:text-[#fafafa]']" @click="handleClick">
    <SvgIcon class="inline-block text-xl" :class="[isActive ? `text-[var(--primary-color)]` : 'text-slate-500 dark:text-[#fafafa]']" :icon="props.icon" />
    <p>{{ props.title }}</p>
  </a>
</template>
