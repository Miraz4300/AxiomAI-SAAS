// @ts-nocheck
<script setup lang='ts'>
import { computed } from 'vue'
import { NCard, NLayout, NLayoutContent, NTabPane, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import Dashboard from './Dashboard.vue'
import System from './System.vue'
import Mail from './Mail.vue'
import Moderation from './Moderation.vue'
import User from './User.vue'
import Key from './Keys.vue'
import Site from './Site.vue'
import Subscription from './Subscription.vue'
import Announcement from './Announcement.vue'
import Merch from './Merch.vue'
import Features from './Features.vue'
import ChatHistory from './ChatHistory.vue'
import { SvgIcon, ToolButton } from '@/components/common'
import { useAuthStore, useUserStore } from '@/store'

const authStore = useAuthStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const active = computed({
  get: () => String(route.query.id ?? 'dashboard'),
  set: value => router.push({ query: { ...route.query, id: value } }),
})

function handleLogout() {
  window.$dialog?.error({
    title: 'Logout',
    content: 'Are you sure to Logout?',
    positiveText: 'logout',
    negativeText: 'cancel',
    onPositiveClick: async () => {
      await authStore.removeToken()
    },
  })
}
</script>

<template>
  <NLayout position="absolute">
    <NLayoutContent>
      <div class="min-h-full p-8">
        <div class="mb-4 flex justify-between">
          <p class="mb-2 text-2xl font-bold text-black dark:text-white">
            Administrator Settings
          </p>
          <div class="flex space-x-2">
            <ToolButton v-if="!!authStore.token" @click="router.replace('/')">
              <SvgIcon class="text-xl" icon="ri:home-3-line" />
            </ToolButton>
            <ToolButton v-if="!!authStore.token" @click="handleLogout">
              <SvgIcon class="text-xl" icon="ri:logout-circle-line" />
            </ToolButton>
          </div>
        </div>
        <div>
          <NTabs v-model:value="active" type="line" animated>
            <NTabPane v-if="userStore.userInfo.root" name="dashboard">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:layout-dashboard" />
                <span class="ml-2">Dashboard</span>
              </template>
              <Dashboard />
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="system">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:server-cog" />
                <span class="ml-2">System Settings</span>
              </template>
              <NCard>
                <System />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="site">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:web" />
                <span class="ml-2">Site Settings</span>
              </template>
              <NCard>
                <Site />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="mail">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:mail-cog" />
                <span class="ml-2">Mail Settings</span>
              </template>
              <NCard>
                <Mail />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="audit">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:security" />
                <span class="ml-2">Moderation</span>
              </template>
              <NCard>
                <Moderation />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="keys">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri:key-line" />
                <span class="ml-2">Keys Settings</span>
              </template>
              <NCard>
                <Key />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="users">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:user-cog" />
                <span class="ml-2">User Management</span>
              </template>
              <NCard>
                <User />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="history">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:history" />
                <span class="ml-2">Chat History</span>
              </template>
              <NCard>
                <ChatHistory />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="subscriptions">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:currency-usd" />
                <span class="ml-2">Subscription Price</span>
              </template>
              <NCard>
                <Subscription />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="merch">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri:shopping-bag-line" />
                <span class="ml-2">Merch Settings</span>
              </template>
              <NCard>
                <Merch />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="announcement">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:announcement" />
                <span class="ml-2">Announcement</span>
              </template>
              <NCard>
                <Announcement />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="features">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:puzzle-plus-outline" />
                <span class="ml-2">Feature Flags</span>
              </template>
              <NCard>
                <Features />
              </NCard>
            </NTabPane>
          </NTabs>
        </div>
      </div>
    </NLayoutContent>
  </NLayout>
</template>
