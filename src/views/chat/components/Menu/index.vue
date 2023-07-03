<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'
import { useAuthStore, useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { ADMIN_ROUTE, SETTING_ROUTE } from '@/router/routes'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const { isMobile } = useBasicLayout()
const buttonClass = 'h-12 w-12 cursor-pointer rounded-xl bg-white dark:bg-[#34373c] text-[#4b9e5f] dark:text-[#86dfba]'
const iconClass = 'flex h-full m-auto text-center text-2xl'
const iconClass2 = 'inline-block text-xl'

function goChat() {
  router.push('/')
}

function goSetting() {
  router.push('/user')
}
</script>

<template>
  <div v-if="!isMobile" class="min-w-[72px] bg-[#e8eaf1] dark:bg-[#202020]">
    <div class="flex h-full flex-col items-center justify-between px-2 py-7">
      <div class="flex flex-col space-y-4">
        <a :class="[buttonClass]" @click="goChat"><SvgIcon :class="[iconClass]" icon="ri:message-3-line" /></a>
      </div>
      <div class="flex flex-col items-center space-y-2">
        <HoverButton v-if="userStore.userInfo.root" @click="router.push(ADMIN_ROUTE)">
          <span class="text-xl text-black dark:text-white">
            <SvgIcon icon="mdi:administrator" />
          </span>
        </HoverButton>
        <HoverButton v-if="!!authStore.token" @click="router.push(SETTING_ROUTE)">
          <UserAvatar class="mt-1.5" />
        </HoverButton>
      </div>
    </div>
  </div>

  <NLayoutFooter v-if="isMobile" class="bg-[#e8eaf1] dark:bg-[#202020]">
    <div class="grid py-2 border-t dark:border-t-neutral-800 grid-cols-2">
      <a class="leading-4 text-center cursor-pointer text-[#4b9e5f] dark:text-[#86dfba]" @click="goChat">
        <SvgIcon :class="[iconClass2]" icon="ri:message-3-line" />
        <p>Chat</p>
      </a>
      <a class="leading-4 text-center cursor-pointer text-[#4b9e5f] dark:text-[#86dfba]" @click="goSetting">
        <SvgIcon :class="[iconClass2]" icon="mdi:account-circle-outline" />
        <p>Personal</p>
      </a>
    </div>
  </NLayoutFooter>
</template>
