<script lang="ts" setup>
import { computed, ref } from 'vue'
import { NButton, NInput, NSelect, useMessage } from 'naive-ui'
import type { Language, Theme } from '@/store/modules/app/helper'
import { SvgIcon, UserAvatar } from '@/components/common'
import { useAppStore, useAuthStore, useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'

const appStore = useAppStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const { isMobile } = useBasicLayout()

const ms = useMessage()

const theme = computed(() => appStore.theme)

const userInfo = computed(() => userStore.userInfo)

const avatar = ref(userInfo.value.avatar ?? '')

const name = ref(userInfo.value.name ?? '')

const description = ref(userInfo.value.description ?? '')

const language = computed({
  get() {
    return appStore.language
  },
  set(value: Language) {
    appStore.setLanguage(value)
  },
})

const themeOptions: { label: string; key: Theme; icon: string }[] = [
  {
    label: 'Auto',
    key: 'auto',
    icon: 'ri:contrast-line',
  },
  {
    label: 'Light',
    key: 'light',
    icon: 'line-md:sunny-outline-loop',
  },
  {
    label: 'Dark',
    key: 'dark',
    icon: 'line-md:moon-alt-loop',
  },
]

const languageOptions: { label: string; key: Language; value: Language }[] = [
  { label: 'বাংলা', key: 'bn-BD', value: 'bn-BD' },
  { label: 'English', key: 'en-US', value: 'en-US' },
]

async function updateUserInfo(options: Partial<UserInfo>) {
  await userStore.updateUserInfo(true, options)
  ms.success(t('common.success'))
}

function handleLogout() {
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
</script>

<template>
  <div class="space-y-6" :class="[isMobile ? 'p-2' : 'p-4']">
    <div class="flex flex-shrink-0 w-[100px] items-center space-x-4">
      <span class="flex-shrink-0 w-[100px]" />
      <UserAvatar :size="100" />
    </div>
    <div class="flex items-center space-x-4">
      <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
      <div class="flex-1">
        <NInput v-model:value="name" placeholder="" />
      </div>
    </div>
    <div class="flex items-center space-x-4">
      <span class="flex-shrink-0 w-[100px]">{{ $t('setting.description') }}</span>
      <div class="flex-1">
        <NInput v-model:value="description" placeholder="Innovative and strategic problem solver." />
      </div>
    </div>
    <div class="flex items-center space-x-4">
      <span class="flex-shrink-0 w-[100px]">{{ $t('setting.avatarLink') }}</span>
      <div class="flex-1">
        <NInput v-model:value="avatar" placeholder="https://example.com/avatar/image.png" />
      </div>
    </div>
    <div class="flex items-center space-x-4">
      <span class="flex-shrink-0 w-[100px]">{{ $t('setting.theme') }}</span>
      <div class="flex flex-wrap items-center gap-4">
        <template v-for="item of themeOptions" :key="item.key">
          <NButton
            size="small"
            :type="item.key === theme ? 'primary' : undefined"
            @click="appStore.setTheme(item.key)"
          >
            <template #icon>
              <SvgIcon :icon="item.icon" />
            </template>
          </NButton>
        </template>
      </div>
    </div>
    <div class="flex items-center space-x-4">
      <span class="flex-shrink-0 w-[100px]">{{ $t('setting.language') }}</span>
      <div class="flex flex-wrap items-center gap-4">
        <NSelect
          style="width: 140px"
          :value="language"
          :options="languageOptions"
          @update-value="value => appStore.setLanguage(value)"
        />
      </div>
    </div>
    <div class="flex flex-shrink-0 w-[100px] items-center space-x-4">
      <span class="flex-shrink-0 w-[100px]" />
      <NButton type="primary" @click="updateUserInfo({ avatar, name, description })">
        {{ $t('common.save') }}
      </NButton>
      <NButton v-if="!!authStore.token" type="warning" @click="handleLogout">
        Logout
      </NButton>
    </div>
  </div>
</template>
