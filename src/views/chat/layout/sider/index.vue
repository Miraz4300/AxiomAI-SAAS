<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NLayoutSider, NPopconfirm } from 'naive-ui'
import List from './List.vue'
import Footer from './Footer.vue'
import { useAppStore, useAuthStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { fetchClearAllChat } from '@/api'
import { SvgIcon } from '@/components/common'

const router = useRouter()
const chatRouteRegex = /^\/chat(\/\w+)?$/
const isChatActive = computed(() => chatRouteRegex.test(router.currentRoute.value.path))
const appStore = useAppStore()
const authStore = useAuthStore()
const chatStore = useChatStore()

const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)

const keyword = ref(chatStore.searchKeyword)

async function handleAdd() {
  await chatStore.addNewHistory()
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

async function clearData(): Promise<void> {
  await fetchClearAllChat()
  localStorage.removeItem('chatStorage')
  location.reload()
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

function handleSearchChat() {
  chatStore.setSearchKeyword(keyword.value)
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
      height: '100%',
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed"
    :collapsed-width="0"
    :width="260"
    :show-trigger="isMobile ? false : 'arrow-circle'"
    collapse-mode="transform"
    bordered
    :style="getMobileClass"
    @update-collapsed="handleUpdateCollapsed"
  >
    <!-- Below div renders when 'Chat' is active -->
    <div v-if="isChatActive" class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4">
          <div class="flex space-x-2">
            <NInput v-model:value="keyword" size="small" :disabled="!!authStore.session?.auth && !authStore.token" clearable :placeholder="$t('chat.searchPlaceholder')" @update:value="handleSearchChat">
              <template #prefix>
                <SvgIcon icon="ri:search-line" />
              </template>
            </NInput>
            <NButton type="primary" size="small" :disabled="!!authStore.session?.auth && !authStore.token" @click="handleAdd">
              <SvgIcon icon="ri:add-line" />
            </NButton>
          </div>
        </div>
        <div class="flex-1 min-h-0 pb-4 mt-8 overflow-hidden">
          <List />
        </div>
        <div class="p-4">
          <NPopconfirm placement="top" @positive-click="clearData">
            <template #trigger>
              <NButton block :disabled="!!authStore.session?.auth && !authStore.token">
                <template #icon>
                  <SvgIcon icon="ri:close-circle-line" />
                </template>
                {{ $t('common.clear') }}
              </NButton>
            </template>
            {{ $t('chat.clearHistoryConfirm') }}
          </NPopconfirm>
        </div>
      </main>
      <Footer v-if="isMobile" />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 w-full h-full bg-black/40" @click="handleUpdateCollapsed" />
  </template>
</template>
