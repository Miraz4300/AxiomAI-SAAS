<script setup lang='ts'>
import { computed } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
import { useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar/index.vue'
import Sider from './sider/index.vue'
import Announcement from '@/components/common/Announcement/index.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useChatStore } from '@/store'

const router = useRouter()
const appStore = useAppStore()
const chatStore = useChatStore()

router.replace({ name: 'Chat', params: { uuid: chatStore.active } })

const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)

const getContainerClass = computed(() => ['h-full', { abc: !isMobile.value && !collapsed.value }])
</script>

<template>
  <div class="flex h-full overflow-hidden" :class="{ 'flex-col': isMobile }">
    <Sidebar v-if="!isMobile" />
    <NLayout class="z-40 transition" :class="getContainerClass" has-sider>
      <Sider />
      <NLayoutContent class="h-full">
        <RouterView v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
        </RouterView>
      </NLayoutContent>
    </NLayout>
    <Sidebar v-if="isMobile" />
    <Announcement />
  </div>
</template>
