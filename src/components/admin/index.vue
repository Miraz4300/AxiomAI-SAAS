<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NModal, NTabPane, NTabs } from 'naive-ui'
import System from '../common/Setting/System.vue'
import Mail from '../common/Setting/Mail.vue'
import Audit from '../common/Setting/Audit.vue'
import User from '../common/Setting/User.vue'
import Key from '../common/Setting/Keys.vue'
import Site from '../common/Setting/Site.vue'
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

const active = ref('General')

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
  <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 80%;">
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
  </NModal>
</template>
