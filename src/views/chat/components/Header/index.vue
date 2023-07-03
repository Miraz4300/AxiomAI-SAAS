<script setup lang='ts'>
import { NModal, NRadioButton, NRadioGroup, NSelect, NSlider, useDialog, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import html2canvas from 'html2canvas'
import { useRoute } from 'vue-router'
import { useAppStore, useAuthStore, useChatStore, useSettingStore, useUserStore } from '@/store'
import type { SettingsState } from '@/store/modules/settings/helper'
import { fetchUpdateUserChatModel } from '@/api'
import { UserConfig } from '@/components/admin/model'
import type { CHATMODEL } from '@/components/admin/model'
import { SvgIcon, ToolButton } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'

const dialog = useDialog()
const ms = useMessage()
const route = useRoute()

const appStore = useAppStore()
const authStore = useAuthStore()
const chatStore = useChatStore()
const settingStore = useSettingStore()
const userStore = useUserStore()

const { isMobile } = useBasicLayout()
const isMobileValue = isMobile.value
const width = isMobileValue ? 'w-[280px]' : 'w-[300px]'
const mt = isMobileValue ? 'mt-3' : ''
const info = 'mt-2 text-xs text-neutral-500 dark:text-gray-400'

const show = ref(false)
const loading = ref<boolean>(false)

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)

const { uuid } = route.params as { uuid: string }
const dataSources = computed(() => chatStore.getChatByUuid(+uuid))

function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'axiomai-chat.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

function handleClear() {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.clearChat'),
    content: t('chat.clearChatConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearChatByUuid(+uuid)
    },
  })
}

const collapsed = computed(() => appStore.siderCollapsed)
function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const memory = ref(settingStore.memory ?? 1)
const marks = {
  1: t('setting.memory1'),
  50: t('setting.memory2'),
  99: t('setting.memory3'),
}
const persona = ref(settingStore.persona ?? 'balanced')
const precise = 'precise'
const balanced = 'balanced'
const creative = 'creative'

function updateSettings(options: Partial<SettingsState>) {
  settingStore.updateSetting(options)
  ms.success(t('common.success'))
}

async function handleSyncChatModel(chatModel: CHATMODEL) {
  if (userStore.userInfo.config == null)
    userStore.userInfo.config = new UserConfig()
  userStore.userInfo.config.chatModel = chatModel
  userStore.recordState()
  await fetchUpdateUserChatModel(chatModel)
}
</script>

<template>
  <header class="relative z-30 border-b border-b-neutral-300 dark:border-b-neutral-800 bg-[#EEE9E9] dark:bg-[#111111] backdrop-blur">
    <div class="m-auto flex h-14 max-w-screen-2xl items-center justify-between" :class="[isMobile ? 'px-2' : 'px-4']">
      <div class="flex min-w-0 flex-1 items-center space-x-2 overflow-hidden pr-2">
        <button
          v-if="isMobile"
          class="flex items-center"
          @click="handleUpdateCollapsed"
        >
          <SvgIcon v-if="collapsed" class="text-2xl" icon="ri:align-justify" />
          <SvgIcon v-else class="text-2xl" icon="ri:align-right" />
        </button>
        <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" :class="[isMobile ? '' : 'text-base font-bold']">
          {{ currentChatHistory?.title ?? '' }}
        </span>
      </div>
      <div v-if="dataSources.length" class="flex items-center space-x-2">
        <ToolButton :tooltip="$t('chat.exportImage')" @click="handleExport">
          <span class="text-xl text-[#4f555e] dark:text-white">
            <SvgIcon icon="mdi:file-export-outline" />
          </span>
        </ToolButton>
        <ToolButton :tooltip="$t('chat.deleteMessage')" @click="handleClear">
          <span class="text-xl text-[#4f555e] dark:text-white">
            <SvgIcon icon="ri:brush-2-line" />
          </span>
        </ToolButton>
      </div>
    </div>
    <div v-if="!!authStore.token && isChatGPTAPI" class="absolute left-1/2 top-full -translate-x-1/2 cursor-pointer select-none rounded-b-md border bg-white px-4 dark:border-neutral-700 dark:bg-[#111114]" @click="show = true">
      <span class="flex items-center space-x-2">
        <span>{{ userStore.userInfo.config.chatModel }}</span>
        <SvgIcon icon="ri:arrow-down-s-line" />
      </span>
    </div>
  </header>

  <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px" title="Advanced">
    <div class="p-4 space-y-5">
      <div class="flex items-center justify-between">
        <span>{{ $t('setting.model') }}</span>
        <div>
          <NSelect
            style="width:200px"
            :value="userStore.userInfo.config.chatModel"
            :options="authStore.session?.chatModels"
            :disabled="!!authStore.session?.auth && !authStore.token"
            @update-value="(val: CHATMODEL) => handleSyncChatModel(val)"
          />
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.memory') }}</span>
        <div :class="[width]">
          <NSlider v-model:value="memory" :marks="marks" step="mark" :tooltip="false" @update:value="updateSettings({ memory })" />
        </div>
      </div>
      <p :class="[info]">
        {{ $t('setting.memory_info') }}
      </p>
      <div class="flex items-center" :class="[isMobile ? 'flex-wrap' : 'justify-between']">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.persona') }}</span>
        <div :class="[mt]">
          <NRadioGroup v-model:value="persona" size="medium" @update:value="updateSettings({ persona })">
            <NRadioButton :value="precise">
              {{ $t('setting.persona1') }}
            </NRadioButton>
            <NRadioButton :value="balanced">
              {{ $t('setting.persona2') }}
            </NRadioButton>
            <NRadioButton :value="creative">
              {{ $t('setting.persona3') }}
            </NRadioButton>
          </NRadioGroup>
        </div>
      </div>
      <p v-if="precise === persona" :class="[info]">
        {{ $t('setting.persona1_info') }}
      </p>
      <p v-else-if="balanced === persona" :class="[info]">
        {{ $t('setting.persona2_info') }}
      </p>
      <p v-else :class="[info]">
        {{ $t('setting.persona3_info') }}
      </p>
    </div>
  </NModal>
</template>
