<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NLayout, NLayoutContent, NTabPane, NTabs } from 'naive-ui'
import System from './System.vue'
import Mail from './Mail.vue'
import Audit from './Audit.vue'
import User from './User.vue'
import Key from './Keys.vue'
import Site from './Site.vue'
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
        </header><main>
          <div>
            <NTabs v-model:value="active" type="line" animated>
              <NTabPane v-if="userStore.userInfo.root" name="Config" tab="Config">
                <template #tab>
                  <SvgIcon class="text-lg" icon="tabler:server-cog" />
                  <span class="ml-2">{{ $t('setting.config') }}</span>
                </template>
                <System />
              </NTabPane>
              <NTabPane v-if="userStore.userInfo.root" name="MailConfig" tab="MailConfig">
                <template #tab>
                  <SvgIcon class="text-lg" icon="tabler:mail-cog" />
                  <span class="ml-2">{{ $t('setting.mailConfig') }}</span>
                </template>
                <Mail />
              </NTabPane>
              <NTabPane v-if="userStore.userInfo.root" name="AuditConfig" tab="AuditConfig">
                <template #tab>
                  <SvgIcon class="text-lg" icon="mdi:security" />
                  <span class="ml-2">{{ $t('setting.auditConfig') }}</span>
                </template>
                <Audit />
              </NTabPane>
              <NTabPane v-if="userStore.userInfo.root" name="UserConfig" tab="UserConfig">
                <template #tab>
                  <SvgIcon class="text-lg" icon="mdi:database-cog-outline" />
                  <span class="ml-2">{{ $t('setting.userConfig') }}</span>
                </template>
                <User />
              </NTabPane>
              <NTabPane v-if="userStore.userInfo.root" name="KeysConfig" tab="KeysConfig">
                <template #tab>
                  <SvgIcon class="text-lg" icon="ri-key-2-line" />
                  <span class="ml-2">{{ $t('setting.keysConfig') }}</span>
                </template>
                <Key />
              </NTabPane>
              <NTabPane v-if="userStore.userInfo.root" name="SiteConfig" tab="SiteConfig">
                <template #tab>
                  <SvgIcon class="text-lg" icon="mdi:web" />
                  <span class="ml-2">{{ $t('setting.siteConfig') }}</span>
                </template>
                <Site />
              </NTabPane>
            </NTabs>
          </div>
        </main>
      </div>
    </NLayoutContent>
  </NLayout>
</template>
