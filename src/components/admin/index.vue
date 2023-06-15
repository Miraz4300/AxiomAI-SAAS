<script setup lang="ts">
import { computed, ref } from 'vue'
import { NLayout, NLayoutContent, NLayoutFooter, NLayoutHeader, NLayoutSider } from 'naive-ui'
import System from './System.vue'
import Mail from './Mail.vue'
import Audit from './Audit.vue'
import User from './User.vue'
import Key from './Keys.vue'
import Site from './Site.vue'
import { useUserStore } from '@/store'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

const userStore = useUserStore()

const active = ref('Config')
const activeMenu = ref(active.value)

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

const handleMenuItemClick = (tabName: string) => {
  active.value = tabName
  activeMenu.value = tabName
}

const components: Record<string, any> = {
  Config: System,
  MailConfig: Mail,
  AuditConfig: Audit,
  UserConfig: User,
  KeysConfig: Key,
  SiteConfig: Site,
}

const getComponent = (tabName: string) => {
  return components[tabName]
}
</script>

<template>
  <NLayout position="absolute">
    <NLayoutHeader style="height: 64px; padding: 24px" bordered>
      Administrator Settings
    </NLayoutHeader>
    <NLayout has-sider position="absolute" style="top: 64px; bottom: 64px">
      <NLayoutSider bordered :width="260" content-style="padding: 24px;">
        <ul class="menu">
          <li :class="{ active: activeMenu === 'Config' }" @click="handleMenuItemClick('Config')">
            System
          </li>
          <li :class="{ active: activeMenu === 'MailConfig' }" @click="handleMenuItemClick('MailConfig')">
            Mail
          </li>
          <li :class="{ active: activeMenu === 'AuditConfig' }" @click="handleMenuItemClick('AuditConfig')">
            Audit
          </li>
          <li :class="{ active: activeMenu === 'UserConfig' }" @click="handleMenuItemClick('UserConfig')">
            Users
          </li>
          <li :class="{ active: activeMenu === 'KeysConfig' }" @click="handleMenuItemClick('KeysConfig')">
            Keys
          </li>
          <li :class="{ active: activeMenu === 'SiteConfig' }" @click="handleMenuItemClick('SiteConfig')">
            Domain
          </li>
        </ul>
      </NLayoutSider>
      <NLayoutContent v-model:show="show">
        <div class="min-h-full p-8">
          <component :is="getComponent(active)" v-if="userStore.userInfo.root" />
        </div>
      </NLayoutContent>
    </NLayout>
  </NLayout>
  <NLayoutFooter bordered position="absolute" style="height: 64px; padding: 24px">
    Footer
  </NLayoutFooter>
</template>

<style scoped>
.menu {
  list-style-type: none;
  padding: 0;
}

.menu li {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.menu li:hover {
  background-color: #0f5fd6;
}

.menu li.active {
  background-color: #0f5fd6;
}
</style>
