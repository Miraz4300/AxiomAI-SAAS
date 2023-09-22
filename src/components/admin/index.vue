<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NCard, NLayout, NLayoutContent, NTabPane, NTabs } from 'naive-ui'
import System from './System.vue'
import Mail from './Mail.vue'
import Audit from './Audit.vue'
import User from './User.vue'
import Key from './Keys.vue'
import Site from './Site.vue'
import Subscription from './Subscription.vue'
import Announcement from './Announcement.vue'
import Merch from './Merch.vue'
import { SvgIcon } from '@/components/common'
import { useUserStore } from '@/store'

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const userStore = useUserStore()

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const active = ref('Config')

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})
</script>

<template>
  <NLayout position="absolute">
    <NLayoutContent v-model:show="show">
      <div class="min-h-full p-8">
        <header class="mb-4">
          <h2 class="mb-2 text-2xl font-bold text-black dark:text-white">
            Administrator Settings
          </h2>
        </header>
        <div>
          <NTabs v-model:value="active" type="line" animated>
            <NTabPane v-if="userStore.userInfo.root" name="Config" tab="Config">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:server-cog" />
                <span class="ml-2">System Settings</span>
              </template>
              <NCard>
                <System />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="MailConfig" tab="MailConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="tabler:mail-cog" />
                <span class="ml-2">Mail Settings</span>
              </template>
              <NCard>
                <Mail />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="AuditConfig" tab="AuditConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:security" />
                <span class="ml-2">Moderation</span>
              </template>
              <NCard>
                <Audit />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="UserConfig" tab="UserConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:database-cog-outline" />
                <span class="ml-2">User Settings</span>
              </template>
              <NCard>
                <User />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="KeysConfig" tab="KeysConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri-key-2-line" />
                <span class="ml-2">Keys Settings</span>
              </template>
              <NCard>
                <Key />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="SiteConfig" tab="SiteConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:web" />
                <span class="ml-2">Site Settings</span>
              </template>
              <NCard>
                <Site />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="SubscriptionConfig" tab="SubscriptionConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:currency-usd" />
                <span class="ml-2">Subscription Price</span>
              </template>
              <NCard>
                <Subscription />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="MerchConfig" tab="MerchConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:currency-usd" />
                <span class="ml-2">Merch Settings</span>
              </template>
              <NCard>
                <Merch />
              </NCard>
            </NTabPane>
            <NTabPane v-if="userStore.userInfo.root" name="AnnouncementConfig" tab="AnnouncementConfig">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:announcement" />
                <span class="ml-2">Announcement</span>
              </template>
              <NCard>
                <Announcement />
              </NCard>
            </NTabPane>
          </NTabs>
        </div>
      </div>
    </NLayoutContent>
  </NLayout>
</template>
