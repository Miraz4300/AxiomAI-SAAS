<script setup lang='ts'>
import { onMounted, ref, watch, watchEffect } from 'vue'
import { NCard, NLayout, NLayoutContent, NTabPane, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
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
import { SvgIcon, ToolButton } from '@/components/common'
import { useAuthStore, useUserStore } from '@/store'

const authStore = useAuthStore()
const userStore = useUserStore()
const active = ref('Config')
const route = useRoute()
const router = useRouter()

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

function goHome() {
  // Redirect to the originally requested page or home page if no redirect query parameter exists
  const redirect = route.query.redirect
  router.replace(redirect ? decodeURIComponent(redirect as string) : '/')
  setTimeout(() => {
    location.reload()
  }, 1000)
}

onMounted(() => {
  const id = route.query.id
  active.value = id ? id as string : 'systemConfig'
  if (!id)
    router.replace({ query: { id: active.value } })
})
watchEffect(() => {
  const id = route.query.id
  if (id)
    active.value = id as string
})
watch(active, (newTab) => {
  router.push({ query: { id: newTab } })
})
</script>

<template>
  <NLayout position="absolute">
    <NLayoutContent>
      <div class="min-h-full p-8">
        <header class="mb-4 flex justify-between">
          <div class="mb-2 text-2xl font-bold text-black dark:text-white">
            Administrator Settings
          </div>
          <div class="flex space-x-2">
            <ToolButton v-if="!!authStore.token" @click="goHome">
              <SvgIcon class="text-xl" icon="ri:home-3-line" />
            </ToolButton>
            <ToolButton v-if="!!authStore.token" @click="handleLogout">
              <SvgIcon class="text-xl" icon="ri:logout-circle-line" />
            </ToolButton>
          </div>
        </header>
        <div>
          <NTabs v-model:value="active" type="line" animated>
            <NTabPane v-if="userStore.userInfo.root" name="systemConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:server-cog" />
                <span class="ml-2">System Settings</span>
              </template>
              <NCard>
                <System />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="siteConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:web" />
                <span class="ml-2">Site Settings</span>
              </template>
              <NCard>
                <Site />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="mailConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:mail-cog" />
                <span class="ml-2">Mail Settings</span>
              </template>
              <NCard>
                <Mail />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="auditConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:security" />
                <span class="ml-2">Moderation</span>
              </template>
              <NCard>
                <Moderation />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="keysConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri:key-line" />
                <span class="ml-2">Keys Settings</span>
              </template>
              <NCard>
                <Key />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="userConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:user-cog" />
                <span class="ml-2">User Management</span>
              </template>
              <NCard>
                <User />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="subscriptionConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:currency-usd" />
                <span class="ml-2">Subscription Price</span>
              </template>
              <NCard>
                <Subscription />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="merchConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri:shopping-bag-line" />
                <span class="ml-2">Merch Settings</span>
              </template>
              <NCard>
                <Merch />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="announcementConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:announcement" />
                <span class="ml-2">Announcement</span>
              </template>
              <NCard>
                <Announcement />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="featuresConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:puzzle-plus-outline" />
                <span class="ml-2">Experimental Features</span>
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
