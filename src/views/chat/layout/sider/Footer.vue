<script setup lang='ts'>
import { defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'
import { useAuthStore, useUserStore } from '@/store'
import { ADMIN_ROUTE } from '@/constants/routes'

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))

const router = useRouter()

const authStore = useAuthStore()

const userStore = useUserStore()

const show = ref(false)

async function handleLogout() {
  await authStore.removeToken()
}
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar />
    </div>
    <HoverButton v-if="!!authStore.token" :tooltip="$t('common.logOut')" @click="handleLogout">
      <span class="text-xl text-black dark:text-white">
        <SvgIcon icon="tabler:logout" />
      </span>
    </HoverButton>
    <HoverButton v-if="!!authStore.token" :tooltip="$t('setting.setting')" @click="show = true">
      <span class="text-xl text-black dark:text-white">
        <SvgIcon icon="ep:setting" />
      </span>
    </HoverButton>
    <HoverButton v-if="userStore.userInfo.root" :tooltip="$t('setting.admin')" @click="router.push(ADMIN_ROUTE)">
      <span class="text-xl text-black dark:text-white">
        <SvgIcon icon="mdi:administrator" />
      </span>
    </HoverButton>
    <Setting v-if="show" v-model:visible="show" />
  </footer>
</template>
