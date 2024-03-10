<script setup lang='ts'>
import { computed, defineAsyncComponent, h, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NInput, NModal, NRadioButton, NRadioGroup, NSelect, NSlider, useDialog, useMessage } from 'naive-ui'
import { useAppStore, useAuthStore, useChatStore, useUserStore } from '@/store'
import { fetchUpdateChatRoomPrompt } from '@/api'
import { SvgIcon, ToolButton } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'

const dialog = useDialog()
const ms = useMessage()
const route = useRoute()

const appStore = useAppStore()
const authStore = useAuthStore()
const chatStore = useChatStore()
const userStore = useUserStore()

const { isMobile } = useBasicLayout()
const info = 'mt-2 text-xs text-neutral-500 dark:text-gray-400'

const show = ref(false)
const testing = ref(false)
const loading = ref<boolean>(false)

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)
const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)
const { uuid } = route.params as { uuid: string }
const dataSources = computed(() => chatStore.getChatByUuid(+uuid))

const nowSelectChatModel = ref<string | null>(null)
const currentChatModel = computed(() => nowSelectChatModel.value ?? currentChatHistory.value?.chatModel ?? userStore.userInfo.config.chatModel)
// Update currentChatModel in localStorage
watch(() => currentChatModel.value, (newVal) => {
  localStorage.setItem('currentChatModel', JSON.stringify(newVal))
})

// Update chatModel in currentChatHistory if both nowSelectChatModel and currentChatHistory have truthy values
if (nowSelectChatModel.value && currentChatHistory.value)
  currentChatHistory.value.chatModel = nowSelectChatModel.value

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

const memory = ref(userStore.userInfo.advanced.memory ?? 5)
const marks = {
  5: t('setting.memory1'),
  50: t('setting.memory2'),
  95: t('setting.memory3'),
}
const persona = ref(userStore.userInfo.advanced.persona ?? 'balanced')
const personas = { precise: t('setting.persona1'), balanced: t('setting.persona2'), creative: t('setting.persona3') }

function updateSettings(sync: boolean) {
  userStore.updateSetting(sync)
}

async function handleSyncChatModel(chatModel: string) {
  nowSelectChatModel.value = chatModel
  await chatStore.setChatModel(chatModel, +uuid)
}

async function handleSaveData() {
  if (!currentChatHistory.value || !currentChatHistory.value)
    return
  testing.value = true
  try {
    const { message } = await fetchUpdateChatRoomPrompt(currentChatHistory.value.prompt ?? '', +uuid) as { status: string; message: string }
    ms.success(message)
    show.value = false
  }
  catch (error: any) {
    ms.success(t('common.success'))
  }
  testing.value = false
  show.value = false

  // Update memory and persona values
  userStore.userInfo.advanced.memory = memory.value
  userStore.userInfo.advanced.persona = persona.value

  updateSettings(false)
}

function renderLabel(option: { value: string }) {
  const icon = option.value.includes('gemini') ? 'ri:google-fill' : 'ri:sparkling-fill'
  return h('div', { class: 'flex items-center gap-2' }, [
    h(SvgIcon, { icon }),
    h('span', { class: 'mb-0.5' }, option.value),
  ])
}

const modelIcon = computed(() => {
  return currentChatModel.value?.includes('gemini') ? 'ri:google-fill' : 'ri:sparkling-fill'
})

const ExportButton = defineAsyncComponent(() => import('../dataExport.vue'))
</script>

<template>
  <div class="relative border-b border-b-neutral-300 dark:border-b-neutral-800">
    <div class="m-auto flex h-14 max-w-screen-2xl items-center justify-between" :class="[isMobile ? 'px-2' : 'px-4']">
      <div class="flex min-w-0 flex-1 items-center space-x-2 overflow-hidden pr-2">
        <ToolButton
          v-if="isMobile"
          class="flex items-center"
          @click="handleUpdateCollapsed"
        >
          <SvgIcon v-if="collapsed" class="text-xl" icon="ri:align-justify" />
          <SvgIcon v-else class="text-xl" icon="ri:align-right" />
        </ToolButton>
        <span class="flex-1 overflow-hidden select-none text-ellipsis whitespace-nowrap max-w-[340px]" :class="[isMobile ? '' : 'font-semibold']">
          {{ currentChatHistory?.title ?? '' }}
        </span>
      </div>
      <div v-if="dataSources.length" class="flex items-center space-x-2">
        <ExportButton />
        <ToolButton :tooltip="!isMobile ? $t('chat.clearChat') : ''" @click="handleClear">
          <SvgIcon class="text-xl" icon="ri:brush-2-line" />
        </ToolButton>
      </div>
    </div>
    <div v-if="!!authStore.token && isChatGPTAPI" class="absolute z-20 left-1/2 top-full -translate-x-1/2 cursor-pointer select-none px-4 rounded-b-md border border-neutral-300 dark:border-neutral-700 bg-[var(--pbc)] dark:bg-[var(--pbc)]" @click="show = true">
      <span class="flex items-center gap-2 hover:text-[var(--primary-color-hover)]">
        <SvgIcon :icon="modelIcon" />
        <span class="whitespace-nowrap">{{ currentChatModel }}</span>
        <SvgIcon icon="ri:arrow-down-s-line" />
      </span>
    </div>
  </div>

  <NModal v-model:show="show" :auto-focus="false" :mask-closable="false" preset="card" style="width: 95%; max-width: 640px" title="Advanced">
    <div>
      <p class="mb-1 select-none">
        {{ $t('setting.prompt') }}
      </p>
      <NInput
        show-count :maxlength="1500"
        clearable
        :value="currentChatHistory && currentChatHistory.prompt"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        :placeholder="t('setting.promptTip')"
        @input="(val: string | undefined) => { if (currentChatHistory) currentChatHistory.prompt = val }"
      />
      <div class="my-4 border-b dark:border-b-neutral-700" />
    </div>
    <div class="mb-2 space-y-3 select-none">
      <div class="flex items-center justify-between">
        <span>{{ $t('setting.model') }}</span>
        <div>
          <NSelect
            style="width:215px"
            :value="currentChatModel"
            :options="authStore.session?.chatModels"
            :disabled="!!authStore.session?.auth && !authStore.token"
            :render-label="renderLabel"
            @update-value="(val) => handleSyncChatModel(val)"
          />
        </div>
      </div>
      <div class="pr-4">
        <div class="flex items-center justify-between">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.memory') }}</span>
          <div :class="[isMobile ? 'w-[200px]' : 'w-[280px]']">
            <NSlider v-model:value="memory" :marks="marks" step="mark" :tooltip="false" />
          </div>
        </div>
      </div>
      <p :class="[info]">
        {{ $t('setting.memory_info') }}
      </p>
      <div class="flex items-center" :class="[isMobile ? 'flex-wrap' : 'justify-between']">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.persona') }}</span>
        <div :class="{ 'mt-3': isMobile }">
          <NRadioGroup v-model:value="persona" size="medium">
            <NRadioButton v-for="(value, key) in personas" :key="key" :value="key">
              {{ value }}
            </NRadioButton>
          </NRadioGroup>
        </div>
      </div>
      <p :class="[info]">
        {{ $t(`setting.${persona}_info`) }}
      </p>
    </div>
    <div class="mt-4 flex items-center justify-end space-x-4">
      <NButton @click="show = false">
        cancel
      </NButton>
      <NButton :loading="testing" type="primary" @click="handleSaveData">
        save
      </NButton>
    </div>
  </NModal>
</template>
