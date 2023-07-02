<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'
import { useAuthStore, useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { ADMIN_ROUTE } from '@/router/routes'

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const show = ref(false)
const { isMobile } = useBasicLayout()

async function handleLogout() {
  await authStore.removeToken()
}
</script>

<template>
  <div v-if="!isMobile" class="min-w-[72px] bg-[#e8eaf1] dark:bg-[#202020]">
    <div class="flex h-full flex-col items-center justify-between px-2 py-7">
      <div class="flex flex-col space-y-4">
        <a class="h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] text-[#4b9e5f] dark:text-[#86dfba] is-active">
          <div class="flex h-full"><div class="m-auto text-center text-2xl"><SvgIcon icon="ri:message-3-line" /></div></div>
        </a>
        <a class="h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] text-[#4b9e5f] dark:text-[#86dfba] is-active">
          <div class="flex h-full"><div class="m-auto text-center text-2xl"><SvgIcon icon="tabler:photo-ai" /></div></div>
        </a>
      </div>
      <div class="flex flex-col items-center space-y-2">
        <HoverButton v-if="!!authStore.token" @click="handleLogout">
          <span class="text-xl text-black dark:text-white">
            <SvgIcon icon="tabler:logout" />
          </span>
        </HoverButton>
        <HoverButton v-if="userStore.userInfo.root" @click="router.push(ADMIN_ROUTE)">
          <span class="text-xl text-black dark:text-white">
            <SvgIcon icon="mdi:administrator" />
          </span>
        </HoverButton>
        <Setting v-if="show" v-model:visible="show" />
        <HoverButton v-if="!!authStore.token" @click="show = true">
          <UserAvatar />
        </HoverButton>
      </div>
    </div>
  </div>

  <NLayoutFooter v-if="isMobile" class="bg-[#e8eaf1] dark:bg-[#202020]">
    <div class="grid py-2 border-t dark:border-t-neutral-800 grid-cols-4">
      <a class="leading-4 text-center cursor-pointer text-[#4b9e5f] dark:text-[#86dfba]">
        <span class="inline-block text-xl"><SvgIcon icon="ri:message-3-line" /></span>
        <p>Chat</p>
      </a>
      <a class="leading-4 text-center cursor-pointer text-slate-500"><span class="inline-block text-xl"><SvgIcon icon="ri:message-3-line" /></span>
        <p>Image</p>
      </a>
      <a class="leading-4 text-center cursor-pointer text-slate-500"><span class="inline-block text-xl"><SvgIcon icon="ri:message-3-line" /></span>
        <p>News</p>
      </a>
      <a class="leading-4 text-center cursor-pointer text-slate-500"><span class="inline-block text-xl"><SvgIcon icon="ri:message-3-line" /></span>
        <p>Personal</p>
      </a>
    </div>
  </NLayoutFooter>
</template>
