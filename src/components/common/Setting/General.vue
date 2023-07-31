<script lang="ts" setup>
import { computed, ref } from 'vue'
import { NAvatar, NButton, NInput, NModal, NSelect, useMessage } from 'naive-ui'
import type { Language, Theme } from '@/store/modules/app/helper'
import { SvgIcon, UserAvatar, UserRole } from '@/components/common'
import { useAppStore, useAuthStore, useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'

const appStore = useAppStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const { isMobile } = useBasicLayout()
const ms = useMessage()
const show = ref(false)

const theme = computed(() => appStore.theme)
const avatar = ref(userInfo.value.avatar ?? '')
const name = ref(userInfo.value.name ?? '')
const description = ref(userInfo.value.description ?? '')

const images = ref(Array.from({ length: 16 }, (_, i) => `/assets/avatar_${i + 1}.jpg`))
const hoverAvatar = ref('')
const selectedAvatar = ref('')

function selectAvatar(avatarUrl: string) {
  selectedAvatar.value = avatarUrl
  avatar.value = avatarUrl
}

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
  show.value = false
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

const spanClass = 'flex-shrink-0 w-[80px]'
const divClass = 'flex items-center space-x-4'
</script>

<template>
  <div class="space-y-6" :class="[isMobile ? 'p-2' : 'p-4']">
    <div class="flex items-center space-x-4">
      <span :class="[isMobile ? '' : 'flex-shrink-0 w-[80px]']" />
      <div>
        <UserAvatar :size="100" :avatar-change="true" @click="show = true" />
      </div>
      <div class="flex-1 pl-2">
        <p class="font-bold" :class="[isMobile && userInfo.name.length > 9 ? 'text-base' : 'text-2xl']">
          {{ userInfo.name }}
        </p>
        <UserRole :sub-link="true" />
      </div>
    </div>
    <div class="pt-6" :class="[divClass]">
      <span :class="[spanClass]">{{ $t('setting.name') }}</span>
      <div class="flex-1">
        <NInput v-model:value="name" maxlength="15" placeholder="" />
      </div>
    </div>
    <div :class="[divClass]">
      <span :class="[spanClass]">{{ $t('setting.description') }}</span>
      <div class="flex-1">
        <NInput v-model:value="description" maxlength="40" placeholder="Innovative and strategic problem solver." />
      </div>
    </div>
    <div :class="[divClass]">
      <span :class="[spanClass]">{{ $t('setting.avatarLink') }}</span>
      <div class="flex-1">
        <NInput v-model:value="avatar" placeholder="https://example.com/avatar/image.png" />
      </div>
    </div>
    <div :class="[divClass]">
      <span :class="[spanClass]">{{ $t('setting.theme') }}</span>
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
    <div :class="[divClass]">
      <span :class="[spanClass]">{{ $t('setting.language') }}</span>
      <div class="flex flex-wrap items-center gap-4">
        <NSelect
          style="width: 140px"
          :value="language"
          :options="languageOptions"
          @update-value="value => appStore.setLanguage(value)"
        />
      </div>
    </div>
    <div :class="[divClass]">
      <span :class="[spanClass]" />
      <NButton type="primary" @click="updateUserInfo({ avatar, name, description })">
        {{ $t('common.save') }}
      </NButton>
      <NButton v-if="!!authStore.token" type="warning" @click="handleLogout">
        Logout
      </NButton>
    </div>
  </div>

  <NModal v-model:show="show" :auto-focus="false" preset="card" style="max-width: 370px" title="Avatar">
    <div class="flex flex-wrap">
      <div v-for="(image, index) in images" :key="index" class="w-1/4 p-1">
        <NAvatar
          :size="68"
          round
          :src="image"
          class="cursor-pointer"
          :style="{
            transform: hoverAvatar === image ? 'scale(1.2)' : 'none',
            border: (selectedAvatar === image || hoverAvatar === image) ? '4px solid #22c55e' : 'none',
            transition: 'transform 0.5s ease, border-color 0.5s ease',
          }"
          @mouseover="hoverAvatar = image"
          @mouseleave="hoverAvatar = ''"
          @click="selectAvatar(image)"
        />
      </div>
    </div>
    <div class="mt-4 flex justify-end space-x-4">
      <NButton @click="show = false">
        cancel
      </NButton>
      <NButton :disabled="selectedAvatar === ''" type="primary" @click="updateUserInfo({ avatar, name, description })">
        save
      </NButton>
    </div>
  </NModal>
</template>
