<script lang="ts" setup>
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import type { DropdownOption } from 'naive-ui'
import { NDropdown, NText } from 'naive-ui'
import { HoverButton, SvgIcon, UserAvatar, UserRole } from '@/components/common'
import { useIconRender } from '@/hooks/useIconRender'
import { useAuthStore, useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { ADMIN_ROUTE, SETTING_ROUTE } from '@/router/routes'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const { iconRender } = useIconRender()
const { isMobile } = useBasicLayout()
const buttonClass = 'h-12 w-12 cursor-pointer rounded-xl bg-white dark:bg-[#34373c] text-[#0083A0] dark:text-[#00B2DB]'
const iconClass = 'flex h-full m-auto text-center text-2xl'
const iconClass2 = 'inline-block text-xl'

const chatRouteRegex = /^\/chat\/\d+$/
const isChatActive = computed(() => chatRouteRegex.test(router.currentRoute.value.path))
const isSettingsActive = computed(() => router.currentRoute.value.path === '/user')

function goChat() {
  if (!chatRouteRegex.test(router.currentRoute.value.path))
    router.push('/')
}

function goSetting() {
  if (router.currentRoute.value.path !== '/user')
    router.push('/user')
}

function userHeader() {
  const { name, description } = userInfo.value
  return h('div', { class: 'flex items-center p-3' }, [
    h(UserAvatar, { class: 'mr-3' }),
    h('div', [
      h('div', { class: 'flex items-center gap-1' }, [
        h(NText, { depth: 2, class: 'font-bold' }, { default: () => name }),
      ]),
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
    window.$dialog?.warning({
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
  <div v-if="!isMobile" class="max-w-[72px] bg-[#e8eaf1] dark:bg-[#202020]">
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
        <NDropdown v-if="!!authStore.token" trigger="hover" :options="options" @select="handleDropdown">
          <UserAvatar />
        </NDropdown>
        <UserRole :icon="false" />
      </div>
    </div>
  </div>

  <NLayoutFooter v-if="isMobile" class="bg-white dark:bg-[#202020]">
    <div class="grid py-2 border-t dark:border-t-neutral-800 grid-cols-2">
      <a class="leading-4 text-center cursor-pointer" :class="[isChatActive ? 'text-[#0083A0] dark:text-[#00B2DB]' : 'text-slate-500 dark:text-[#fafafa]']" @click="goChat">
        <SvgIcon :class="[iconClass2]" icon="ri:message-3-line" />
        <p>{{ $t('chat.chat') }}</p>
      </a>
      <a class="leading-4 text-center cursor-pointer" :class="[isSettingsActive ? 'text-[#0083A0] dark:text-[#00B2DB]' : 'text-slate-500 dark:text-[#fafafa]']" @click="goSetting">
        <SvgIcon :class="[iconClass2]" icon="ri:settings-3-line" />
        <p>{{ $t('setting.setting') }}</p>
      </a>
    </div>
  </NLayoutFooter>
</template>
