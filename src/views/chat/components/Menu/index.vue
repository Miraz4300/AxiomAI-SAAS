<script lang="ts" setup>
import { useRouter } from 'vue-router'
import type { DropdownOption } from 'naive-ui'
import { NDropdown, NText } from 'naive-ui'
import { computed, h } from 'vue'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'
import { useIconRender } from '@/hooks/useIconRender'
import { useAuthStore, useUserStore } from '@/store'
import { isString } from '@/utils/is'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { ADMIN_ROUTE, SETTING_ROUTE } from '@/router/routes'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const { iconRender } = useIconRender()
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

function userHeader() {
  return h('div', { class: 'flex items-center p-3' }, [
    h(UserAvatar, { class: 'mr-3' }),
    h('div', [
      h(NText, { depth: 2, class: 'font-bold' }, { default: () => userInfo.value.name }),
      h(NText, { depth: 3, class: 'text-xs' }, {
        default: () => h('div', {
          innerHTML: (isString(userInfo.value.description) && userInfo.value.description !== '') ? userInfo.value.description : '',
        }),
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
    label: 'Profile',
    key: 'user-center',
    icon: iconRender({ icon: 'mdi:account-circle-outline' }),
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: iconRender({ icon: 'ri:logout-box-line' }),
  },
]

type DropdownKey = 'user-center' | 'logout'

function handleDropdown(optionKey: string) {
  const key = optionKey as DropdownKey
  if (key === 'logout') {
    window.$dialog?.warning({
      title: 'Logout',
      content: 'Are you sure to Logout?',
      positiveText: 'logout',
      negativeText: 'cancel',
      onPositiveClick: async () => {
        await authStore.removeToken()
      },
    })
  }
  else if (key === 'user-center') {
    router.push(SETTING_ROUTE)
  }
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
        <NDropdown v-if="!!authStore.token" trigger="hover" :options="options" @select="handleDropdown">
          <UserAvatar class="cursor-pointer" />
        </NDropdown>
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
