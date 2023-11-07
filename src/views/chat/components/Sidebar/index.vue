<script lang="ts" setup>
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import type { DropdownOption } from 'naive-ui'
import { NDropdown, NText } from 'naive-ui'
import { HoverButton, MenuButton, SvgIcon, UserAvatar, UserRole } from '@/components/common'
import { useIconRender } from '@/hooks/useIconRender'
import { useAppStore, useAuthStore, useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { ADMIN_ROUTE, SETTING_ROUTE } from '@/router/routes'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const { iconRender } = useIconRender()
const { isMobile } = useBasicLayout()
const iconClass2 = 'inline-block text-xl'

const chatRouteRegex = /^\/chat\/\d+$/
const isChatActive = computed(() => chatRouteRegex.test(router.currentRoute.value.path))
const isSettingsActive = computed(() => router.currentRoute.value.path === '/user')
const isDrawActive = computed(() => router.currentRoute.value.path === '/whiteboard')
const whiteboardEnabled = computed(() => appStore.whiteboardEnabled)

function goChat() {
  if (!chatRouteRegex.test(router.currentRoute.value.path))
    router.push('/')
}

function goDraw() {
  if (router.currentRoute.value.path !== '/user')
    router.push('/whiteboard')
}

function goSetting() {
  if (router.currentRoute.value.path !== '/user')
    router.push('/user')
}

function userHeader() {
  const { email, name, description } = userInfo.value
  return h('div', { class: 'flex items-center p-3 min-w-[16rem]' }, [
    h(UserAvatar, { class: 'mr-3' }),
    h('div', [
      h('div', { class: 'flex items-center gap-1' }, [
        h(NText, { depth: 2, class: 'font-bold' }, { default: () => name }),
      ]),
      h(NText, { depth: 3, class: 'text-xs' }, {
        default: () => h('div', { innerText: email }),
      }),
      h(NText, { depth: 3, class: 'text-xs' }, {
        default: () => h('div', { innerText: description }),
      }),
    ]),
  ])
}

const options: DropdownOption[] = [
  {
    key: 'header',
    type: 'render',
    render: userHeader,
  },
  {
    type: 'divider',
    key: 'divider',
  },
  {
    label: 'Settings',
    key: 'settings',
    icon: iconRender({ icon: 'ri:settings-3-line' }),
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: iconRender({ icon: 'ri:logout-circle-line' }),
  },
]

type DropdownKey = 'settings' | 'logout'

async function handleDropdown(optionKey: string) {
  const key = optionKey as DropdownKey
  if (key === 'logout') {
    window.$dialog?.error({
      title: 'Logout',
      content: 'Are you sure to Logout?',
      positiveText: 'logout',
      negativeText: 'cancel',
      onPositiveClick: async () => {
        try {
          await authStore.removeToken()
        }
        catch (error) {
          console.error('Error removing token: ', error)
          // Add any user-facing error handling here
        }
      },
    })
  }
  else if (key === 'settings' && router.currentRoute.value.path !== SETTING_ROUTE) {
    router.push(SETTING_ROUTE)
  }
}
</script>

<template>
  <div v-if="!isMobile" class="min-w-[70px] flex flex-col items-center justify-between overflow-hidden py-6 pt-6 bg-[#e8eaf1] dark:bg-[#25272D]">
    <div class="mb-4 flex flex-col space-y-3 overflow-y-auto overflow-x-hidden px-2">
      <div class="flex w-full flex-col justify-center">
        <MenuButton :tooltip="$t('chat.chat')" placement="right" @click="goChat">
          <SvgIcon class="inline-block text-2xl transition hover:scale-110 hover:text-[var(--primary-color-hover)] hover:dark:text-[var(--primary-color-hover)]" :class="[isChatActive ? `text-[var(--primary-color)]` : 'text-slate-500 dark:text-[#fafafa]']" icon="ri:message-3-line" />
        </MenuButton>
      </div>
      <div v-if="!!authStore.token && whiteboardEnabled" class="flex w-full flex-col justify-center">
        <MenuButton :tooltip="$t('chat.draw')" placement="right" @click="goDraw">
          <SvgIcon class="inline-block text-2xl transition hover:scale-110 hover:text-[var(--primary-color-hover)] hover:dark:text-[var(--primary-color-hover)]" :class="[isDrawActive ? `text-[var(--primary-color)]` : 'text-slate-500 dark:text-[#fafafa]']" icon="ri:artboard-line" />
        </MenuButton>
      </div>
    </div>

    <div class="siderbar-action flex select-none flex-col items-center space-y-2">
      <div class="flex flex-col items-center space-y-2">
        <HoverButton v-if="userStore.userInfo.root" @click="router.push(ADMIN_ROUTE)">
          <SvgIcon class="text-xl text-black dark:text-white" icon="mdi:administrator" />
        </HoverButton>
        <NDropdown v-if="!!authStore.token" trigger="hover" :options="options" @select="handleDropdown">
          <UserAvatar />
        </NDropdown>
        <UserRole :icon="false" />
      </div>
    </div>
  </div>

  <NLayoutFooter v-if="isMobile" class="bg-white dark:bg-[#202020]">
    <div class="grid py-2 border-t dark:border-t-neutral-800 select-none" :class="[whiteboardEnabled ? 'grid-cols-3' : 'grid-cols-2']">
      <a class="leading-4 text-center cursor-pointer" :class="[isChatActive ? `text-[var(--primary-color)]` : 'text-slate-500 dark:text-[#fafafa]']" @click="goChat">
        <SvgIcon :class="[iconClass2]" icon="ri:message-3-line" />
        <p>{{ $t('chat.chat') }}</p>
      </a>
      <a v-if="!!authStore.token && whiteboardEnabled" class="leading-4 text-center cursor-pointer" :class="[isDrawActive ? `text-[var(--primary-color)]` : 'text-slate-500 dark:text-[#fafafa]']" @click="goDraw">
        <SvgIcon :class="[iconClass2]" icon="ri:artboard-line" />
        <p>{{ $t('chat.draw') }}</p>
      </a>
      <a v-if="!!authStore.token" class="leading-4 text-center cursor-pointer" :class="[isSettingsActive ? `text-[var(--primary-color)]` : 'text-slate-500 dark:text-[#fafafa]']" @click="goSetting">
        <SvgIcon :class="[iconClass2]" icon="ri:settings-3-line" />
        <p>{{ $t('setting.setting') }}</p>
      </a>
    </div>
  </NLayoutFooter>
</template>
