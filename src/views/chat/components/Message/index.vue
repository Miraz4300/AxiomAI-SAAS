<script setup lang='ts'>
import { ref } from 'vue'
import { NButtonGroup, NPopover, NSpace, useMessage } from 'naive-ui'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { SvgIcon } from '@/components/common'
import { t } from '@/locales'
import { copyToClip } from '@/utils/copy'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import SpeakBtn from '@/components/voice-output/speak-btn.vue'
import { useSpeechStore } from '@/store/modules/speech'

interface Props {
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
  responseCount?: number
  usage?: {
    completion_tokens: number
    prompt_tokens: number
    total_tokens: number
    estimated: boolean
  }
}
const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const { isMobile } = useBasicLayout()

const speechStore = useSpeechStore()

interface Emit {
  (ev: 'regenerate'): void
  (ev: 'delete'): void
  (ev: 'responseHistory', historyIndex: number): void
}

const message = useMessage()

const textRef = ref<HTMLElement>()

const asRawText = ref(props.inversion)

const messageRef = ref<HTMLElement>()

const indexRef = ref<number>(0)
indexRef.value = props.responseCount ?? 0

function handleRegenerate() {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}

async function handleCopy() {
  try {
    await copyToClip(props.text || '')
    message.success(t('chat.copied'))
  }
  catch {
    message.error(t('chat.copyfail'))
  }
}

async function handlePreviousResponse(next: number) {
  if (indexRef.value + next < 1 || indexRef.value + next > props.responseCount!)
    return
  indexRef.value += next
  emit('responseHistory', indexRef.value - 1)
}
</script>

<template>
  <div
    ref="messageRef"
    class="flex w-full mb-6 overflow-hidden"
    :class="[{ 'flex-row-reverse': inversion }]"
  >
    <div
      class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
      :class="[inversion ? 'ml-2' : 'mr-2']"
    >
      <AvatarComponent :image="inversion" />
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p v-if="inversion" class="text-xs text-neutral-500 dark:text-[#A6AEB9] select-none" :class="[inversion ? 'text-right' : 'text-left']">
        {{ new Date(dateTime as string).toLocaleString() }}
      </p>
      <p v-else class="text-xs text-neutral-500 dark:text-[#A6AEB9] select-none" :class="[inversion ? 'text-right' : 'text-left']">
        <NSpace size="small">
          AxiomAI | {{ new Date(dateTime as string).toLocaleString() }}
          <template v-if="usage">
            <NPopover trigger="hover">
              <template #trigger>
                <span class="cursor-pointer">
                  <span>[</span>
                  <span>{{ usage.estimated ? '' : '' }}</span>
                  <span>{{ usage.total_tokens }} Tokens</span>
                  <span>]</span>
                </span>
              </template>
              <span class="text-xs">
                {{ usage.estimated ? t('chat.usageEstimate') : '' }}
                {{ t('chat.usagePrompt') }} {{ usage.prompt_tokens }}
                + {{ t('chat.usageResponse') }} {{ usage.completion_tokens }}
                = {{ t('chat.usageTotal') }} {{ usage.total_tokens }}
              </span>
            </NPopover>
          </template>
          <NButtonGroup v-if="!inversion && responseCount && responseCount > 1">
            <NButton
              style="cursor: pointer;"
              :disabled="indexRef === 1"
              @click="handlePreviousResponse(-1)"
            >
              <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="5 -5 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="15 18 9 12 15 6" /></svg>
            </NButton>
            <span class="text-xs text-neutral-500 dark:text-[#A6AEB9]"> {{ indexRef }} / {{ responseCount }}</span>
            <NButton
              style="cursor: pointer;"
              :disabled="indexRef === responseCount"
              @click="handlePreviousResponse(1)"
            >
              <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="-5 -5 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="9 18 15 12 9 6" /></svg>
            </NButton>
          </NButtonGroup>
        </NSpace>
      </p>
      <div
        class="flex items-end gap-1 mt-2"
        :class="[inversion ? 'flex-row-reverse' : 'flex-row']"
      >
        <TextComponent
          ref="textRef"
          :inversion="inversion"
          :error="error"
          :text="text"
          :loading="loading"
          :as-raw-text="asRawText"
        />
      </div>
      <div class="flex mt-2 space-x-2 text-base" :class="[!inversion ? 'justify-start' : 'justify-end']">
        <button
          v-if="!inversion"
          :title="t('chat.regenerate')"
          class="mb-2 transition text-gray-500 hover:text-neutral-900 dark:hover:text-neutral-200"
          @click="handleRegenerate"
        >
          <SvgIcon icon="ri:restart-line" />
        </button>
        <SpeakBtn
          v-if="!isMobile && !inversion && speechStore.enable"
          :loading="loading"
          class="mb-2 transition text-gray-500 hover:text-neutral-900 dark:hover:text-neutral-200"
          :text="text"
          :title="t('chat.speech')"
        />
        <button
          class="mb-2 transition text-gray-500 hover:text-neutral-900 dark:hover:text-neutral-200"
          :title="t('chat.copy')"
          @click="handleCopy"
        >
          <SvgIcon icon="ri:file-copy-line" />
        </button>
        <button
          v-if="!props.inversion"
          class="mb-2 transition text-gray-500 hover:text-neutral-900 dark:hover:text-neutral-200"
          :title="asRawText ? t('chat.preview') : t('chat.showRawText')"
          @click="asRawText = !asRawText"
        >
          <SvgIcon :icon="asRawText ? 'ri:file-word-line' : 'ri:file-code-line'" />
        </button>
        <button
          class="mb-2 transition text-gray-500 hover:text-neutral-900 dark:hover:text-neutral-200"
          :title="t('common.delete')"
          @click="emit('delete')"
        >
          <SvgIcon icon="ri:delete-bin-line" />
        </button>
      </div>
    </div>
  </div>
</template>
