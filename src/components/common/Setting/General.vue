<script setup lang="ts">
import { computed, ref } from 'vue'
import { NAvatar, NButton, NInput, NModal, NSelect } from 'naive-ui'
import type { Language, Theme } from '@/store/modules/app/helper'
import { SvgIcon, UserAvatar, UserRole } from '@/components/common'
import { useAppStore, useAuthStore, useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { router } from '@/router'

const appStore = useAppStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const { isMobile } = useBasicLayout()
const show = ref(false)

const theme = computed(() => appStore.theme)
const avatar = ref(userInfo.value.avatar ?? '')
const email = ref(userInfo.value.email ?? '')
const name = ref(userInfo.value.name ?? '')
const title = ref(userInfo.value.title ?? '')

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
  { label: 'Auto', key: 'auto', icon: 'ri:contrast-line' },
  { label: 'Light', key: 'light', icon: 'line-md:sunny-outline-loop' },
  { label: 'Dark', key: 'dark', icon: 'line-md:moon-alt-loop' },
]

const languageOptions: { label: string; key: Language; value: Language }[] = [
  { label: 'বাংলা', key: 'bn-BD', value: 'bn-BD' },
  { label: 'English', key: 'en-US', value: 'en-US' },
]

async function updateUserInfo(options: Partial<UserInfo>) {
  if (!options.name) {
    window.$message?.error('Name cannot be empty')
    return
  }

  await userStore.updateUserInfo(true, options)
  window.$message?.success(t('common.success'))
  show.value = false
}

function handleLogout() {
  window.$dialog?.error({
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
      <span :class="{ 'flex-shrink-0 w-[80px]': !isMobile }" />
      <div>
        <UserAvatar :size="110" :avatar-change="true" @click="show = true" />
      </div>
      <div class="flex-1 pl-2">
        <p class="font-bold" :class="[isMobile && userInfo.name.length > 9 ? 'text-base' : 'text-2xl']">
          {{ userInfo.name }}
        </p>
        <UserRole :sub-link="true" />
      </div>
    </div>
    <div class="pt-6 flex items-baseline space-x-4">
      <span :class="[spanClass]">{{ $t('setting.email') }}</span>
      <div class="flex-1 flex-col">
        <div class="flex-1">
          <NInput :placeholder="email" disabled />
        </div>
        <p class="cursor-pointer text-xs text-black/60 dark:text-white/50 hover:text-[var(--primary-color-hover)] hover:dark:text-[var(--primary-color-hover)] text-right" @click="router.replace('/settings?id=password')">
          Need to change password? click here.
        </p>
      </div>
    </div>
    <div :class="[divClass]">
      <span :class="[spanClass]">{{ $t('setting.name') }}</span>
      <div class="flex-1">
        <NInput v-model:value="name" maxlength="15" placeholder="" />
        <p v-if="!name" class="text-red-500">
          Name cannot be empty
        </p>
      </div>
    </div>
    <div :class="[divClass]">
      <span :class="[spanClass]">{{ $t('setting.title') }}</span>
      <div class="flex-1">
        <NInput v-model:value="title" maxlength="40" placeholder="Innovative and strategic problem solver." />
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
      <NButton type="primary" @click="updateUserInfo({ avatar, name, title })">
        {{ $t('common.save') }}
      </NButton>
      <NButton v-if="!!authStore.token" type="error" @click="handleLogout">
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
      <NButton :disabled="selectedAvatar === ''" type="primary" @click="updateUserInfo({ avatar, name, title })">
        save
      </NButton>
    </div>
  </NModal>
</template>
