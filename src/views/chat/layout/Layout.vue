<script setup lang='ts'>
import { computed } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
import { useRouter } from 'vue-router'
import Menu from '../components/Menu/index.vue'
import Sider from './sider/index.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useChatStore } from '@/store'

const router = useRouter()
const appStore = useAppStore()
const chatStore = useChatStore()

router.replace({ name: 'Chat', params: { uuid: chatStore.active } })

const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)

const getMobileClass = computed(() => (isMobile.value ? ['rounded-none', 'shadow-none'] : ['border', 'rounded-none', 'shadow-md', 'dark:border-neutral-800']))
const getContainerClass = computed(() => ['h-full', { 'pl-[260px]': !isMobile.value && !collapsed.value }])
const getMobileMenu = computed(() => (isMobile.value ? ['flex', 'flex-col', 'h-full'] : ['']))
</script>

<template>
  <div class="flex h-full overflow-hidden" :class="[getMobileClass, getMobileMenu]">
    <Menu v-if="!isMobile" />
    <NLayout class="z-40 transition" :class="getContainerClass" has-sider>
      <Sider />
      <NLayoutContent class="h-full">
        <RouterView v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
        </RouterView>
      </NLayoutContent>
    </NLayout>
    <Menu v-if="isMobile" />
  </div>
</template>
