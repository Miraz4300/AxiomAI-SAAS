<script lang="ts" setup>
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import type { DropdownOption } from 'naive-ui'
import { NDropdown, NLayoutFooter, NText } from 'naive-ui'
import { MenuButton, UserAvatar, UserRole } from '@/components/common'
import { useIconRender } from '@/hooks/useIconRender'
import { useAuthStore, useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { ADMIN_ROUTE, SETTING_ROUTE } from '@/router/routes'
import { useTheme } from '@/hooks/useTheme'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const { dropdownThemeOverrides } = useTheme()
const { iconRender } = useIconRender()
const { isMobile } = useBasicLayout()

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
    label: 'Administrator',
    key: 'admin',
    show: userStore.userInfo.root || false,
    icon: iconRender({ icon: 'mdi:administrator' }),
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: iconRender({ icon: 'ri:logout-circle-line' }),
  },
]

type DropdownKey = 'settings' | 'admin' | 'logout'

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
  else if (key === 'admin' && userStore.userInfo.root && router.currentRoute.value.path !== ADMIN_ROUTE) {
    router.push(ADMIN_ROUTE)
  }
}
</script>

<template>
  <div v-if="!isMobile" class="min-w-[70px] flex flex-col items-center justify-between overflow-hidden py-6 pt-6 bg-[var(--sbc)] dark:bg-[var(--sbc)]">
    <div v-if="!!authStore.token" class="mb-4 flex flex-col space-y-3 overflow-y-auto overflow-x-hidden px-2">
      <MenuButton :tooltip="$t('chat.chat')" route="/chat" icon="ri:message-3-line" />
      <MenuButton :tooltip="$t('chat.cognitiveDocs')" route="/cognitive-docs" app-store-flag="cognitiveDocsEnabled" icon="ri:file-pdf-line" />
      <MenuButton :tooltip="$t('chat.draw')" route="/whiteboard" app-store-flag="whiteboardEnabled" icon="ri:artboard-line" />
    </div>

    <div class="siderbar-action flex select-none flex-col items-center space-y-2">
      <div class="flex flex-col items-center space-y-2">
        <NDropdown v-if="!!authStore.token" trigger="hover" :options="options" :theme-overrides="dropdownThemeOverrides.Dropdown" @select="handleDropdown">
          <UserAvatar />
        </NDropdown>
        <UserRole :icon="false" />
      </div>
    </div>
  </div>

  <div v-else>
    <NLayoutFooter class="bg-[var(--sbc)] dark:bg-[var(--sbc)]">
      <div v-if="!!authStore.token" class="grid py-2 border-t dark:border-t-neutral-800 select-none grid-cols-2">
        <MenuButton :title="$t('chat.chat')" icon="ri:message-3-line" route="/chat" />
        <MenuButton :title="$t('setting.setting')" icon="ri:settings-3-line" route="/user" />
      </div>
    </NLayoutFooter>
  </div>
</template>
