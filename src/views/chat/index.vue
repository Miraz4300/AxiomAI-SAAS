<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { MessageReactive } from 'naive-ui'
import { NButton, NDivider, NInput, NSpace, NSwitch, NTooltip, NUpload, UploadFileInfo, useDialog, useMessage } from 'naive-ui'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import Header from './components/Header/index.vue'
import promptStore from './components/Home/prompts.json'
import Splash from './components/Home/index.vue'
import OldSplash from './components/Home/oldGreeting.vue'
import { SvgIcon, ToolButton } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStore, useChatStore, useUserStore } from '@/store'
import { fetchChatAPIProcess, fetchChatResponseoHistory, fetchChatStopResponding } from '@/api'
import { t } from '@/locales'
import { useSpeechStore } from '@/store/modules/speech'
import { debounce } from '@/utils/functions/debounce'
import { useTheme } from '@/hooks/useTheme'
import { useisFree } from '@/utils/functions/isFree'

const { isFree } = useisFree()

let controller = new AbortController()
let lastChatInfo: any = {}

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const route = useRoute()
const dialog = useDialog()
const ms = useMessage()
const appStore = useAppStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const chatStore = useChatStore()
const speechStore = useSpeechStore()

const { inputThemeOverrides } = useTheme()
const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom, scrollTo } = useScroll()

const { uuid } = route.params as { uuid: string }

const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)
const usingContext = computed(() => currentChatHistory?.value?.usingContext ?? true)
const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))

// Call the action of fetching user features when the page is loaded
appStore.UserFeatures()
const chatFooterEnabled = computed(() => appStore.chatFooterEnabled)
const chatFooterText = computed(() => appStore.chatFooterText)
const internetAccessEnabled = computed(() => appStore.internetAccessEnabled)

const prompt = ref<string>('')
const firstLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)

const currentChatModel = ref(JSON.parse(localStorage.getItem('currentChatModel') as string))
const isVisionModel = computed(() => currentChatModel.value?.includes('vision'))

let loadingms: MessageReactive
let allmsg: MessageReactive
let prevScrollTop: number

// If the page is refreshed for unknown reasons, the loading status will not be reset, so it can be reset manually.
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(+uuid, index, { loading: false })
})

// Generate random prompt text using Fisher-Yates shuffle algorithm
const promptText = ref<any[]>(Array.from(promptStore))
const randomPrompt = shuffleArray(promptText.value).slice(0, 5)
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Fill chat placeholder with generated prompt text and submit
function fillTextarea(text: string) {
  if (authStore.session?.auth && authStore.token)
    prompt.value = text
  handleSubmit()
}

function handleSubmit() {
  onConversation()
}

const uploadFileKeysRef = ref<string[]>([])

async function onConversation() {
  let message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  const uploadFileKeys = isVisionModel.value ? uploadFileKeysRef.value : []
  uploadFileKeysRef.value = []

  controller = new AbortController()

  const chatUuid = Date.now()
  addChat(
    +uuid,
    {
      uuid: chatUuid,
      dateTime: new Date().toLocaleString(),
      text: message,
      images: uploadFileKeys,
      inversion: true,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
    },
  )
  scrollToBottom()

  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {}
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext && usingContext.value)
    options = { ...lastContext }

  addChat(
    +uuid,
    {
      uuid: chatUuid,
      dateTime: new Date().toLocaleString(),
      text: 'Thinking',
      loading: true,
      inversion: false,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )
  scrollToBottom()

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        roomId: +uuid,
        uuid: chatUuid,
        prompt: message,
        uploadFileKeys,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            lastChatInfo = data
            const usage = (data.detail && data.detail.usage)
              ? {
                  completion_tokens: data.detail.usage.completion_tokens || null,
                  prompt_tokens: data.detail.usage.prompt_tokens || null,
                  total_tokens: data.detail.usage.total_tokens || null,
                  estimated: data.detail.usage.estimated || null,
                }
              : undefined
            updateChat(
              +uuid,
              dataSources.value.length - 1,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
                usage,
              },
            )

            if (openLongReply && data.detail && data.detail.choices.length > 0 && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }

            scrollToBottomIfAtBottom()
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(+uuid, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      +uuid,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
  }
}

async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]
  let responseCount = dataSources.value[index].responseCount || 1
  responseCount++

  let message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true
  const chatUuid = dataSources.value[index].uuid
  updateChat(
    +uuid,
    index,
    {
      dateTime: new Date().toLocaleString(),
      text: 'Regenerating',
      inversion: false,
      responseCount,
      error: false,
      loading: true,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        roomId: +uuid,
        uuid: chatUuid || Date.now(),
        regenerate: true,
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            lastChatInfo = data
            const usage = (data.detail && data.detail.usage)
              ? {
                  completion_tokens: data.detail.usage.completion_tokens || null,
                  prompt_tokens: data.detail.usage.prompt_tokens || null,
                  total_tokens: data.detail.usage.total_tokens || null,
                  estimated: data.detail.usage.estimated || null,
                }
              : undefined
            updateChat(
              +uuid,
              index,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                responseCount,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
                usage,
              },
            )

            if (openLongReply && data.detail && data.detail.choices.length > 0 && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(+uuid, index, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        index,
        {
          loading: false,
        },
      )
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(
      +uuid,
      index,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        responseCount,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
  }
  finally {
    loading.value = false
  }
}

async function onResponseHistory(index: number, historyIndex: number) {
  const chat = (await fetchChatResponseoHistory(+uuid, dataSources.value[index].uuid || Date.now(), historyIndex)).data
  updateChat(
    +uuid,
    index,
    {
      dateTime: chat.dateTime,
      text: chat.text,
      inversion: false,
      responseCount: chat.responseCount,
      error: true,
      loading: false,
      conversationOptions: chat.conversationOptions,
      requestOptions: { prompt: chat.requestOptions.prompt, options: { ...chat.requestOptions.options } },
      usage: chat.usage,
    },
  )
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}

async function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
    await fetchChatStopResponding(lastChatInfo.text, lastChatInfo.id, lastChatInfo.conversationId)
  }
}

async function loadMoreMessage(event: any) {
  const chatIndex = chatStore.chat.findIndex(d => d.uuid === +uuid)
  if (chatIndex <= -1 || chatStore.chat[chatIndex].data.length <= 0)
    return

  const scrollPosition = event.target.scrollHeight - event.target.scrollTop

  const lastId = chatStore.chat[chatIndex].data[0].uuid
  await chatStore.syncChat({ uuid: +uuid } as Chat.History, lastId, () => {
    loadingms && loadingms.destroy()
    nextTick(() => scrollTo(event.target.scrollHeight - scrollPosition))
  }, () => {
    loadingms = ms.loading(
      'Loading...', {
        duration: 0,
      },
    )
  }, () => {
    allmsg && allmsg.destroy()
    allmsg = ms.info('Synced', {
      duration: 1000,
    })
  })
}

const handleLoadMoreMessage = debounce(loadMoreMessage, 300)
const handleSyncChat
  = debounce(() => {
    // Brush directly, there is a very small probability of not requesting
    chatStore.syncChat({ uuid: Number(uuid) } as Chat.History, undefined, () => {
      firstLoading.value = false
      const scrollRef = document.querySelector('#scrollRef')
      if (scrollRef)
        nextTick(() => scrollRef.scrollTop = scrollRef.scrollHeight)
      if (inputRef.value && !isMobile.value)
        inputRef.value?.focus()
    })
  }, 200)

async function handleScroll(event: any) {
  const scrollTop = event.target.scrollTop
  if (scrollTop < 50 && (scrollTop < prevScrollTop || prevScrollTop === undefined))
    handleLoadMoreMessage(event)
  prevScrollTop = scrollTop
}

async function handleToggleUsingContext() {
  if (!currentChatHistory.value)
    return
  currentChatHistory.value.usingContext = !currentChatHistory.value.usingContext
  chatStore.setUsingContext(currentChatHistory.value.usingContext, +uuid)
  if (currentChatHistory.value.usingContext)
    ms.success(t('chat.turnOnContext'))
  else
    ms.warning(t('chat.turnOffContext'))
}

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

function handleVoiceChange(v: string[]) {
  prompt.value = v.filter(item => !!item).join('')
}
const handleReset = () => chatStore.clearChatByUuid(+uuid)
function handleVoiceSubmit() {
  if (!loading.value)
    handleSubmit()
}

// https://github.com/tusen-ai/naive-ui/issues/4887
function handleFinish(options: { file: UploadFileInfo; event?: ProgressEvent }) {
  if (options.file.status === 'finished') {
    const response = (options.event?.target as XMLHttpRequest).response
    uploadFileKeysRef.value.push(`${response.data.fileKey}`)
  }
}
function handleDeleteUploadFile() {
  uploadFileKeysRef.value.pop()
}
const uploadHeaders = computed(() => {
  const token = useAuthStore().token
  return {
    Authorization: `Bearer ${token}`,
  }
})

onMounted(() => {
  firstLoading.value = true
  handleSyncChat()

  if (authStore.token) {
    const chatModels = authStore.session?.chatModels
    if (chatModels != null && chatModels.filter(d => d.value === userStore.userInfo.config.chatModel).length <= 0)
      ms.error('The selected model doesn\'t exist, please choose another.', { duration: 4000 })
  }
})

watch(() => chatStore.active, (_newVal, _oldVal) => {
  handleSyncChat()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})

const Speech = defineAsyncComponent(() => import('@/components/voice-output/auto-speak.vue'))
const Voice = defineAsyncComponent(() => import('@/components/voice-input/index.vue'))
</script>

<template>
  <div class="flex h-full flex-col">
    <Header />
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto" @scroll="handleScroll">
        <div id="image-wrapper" class="w-full max-w-screen-xl pt-6 m-auto" :class="[isMobile ? 'p-2' : 'p-4']">
          <template v-if="!dataSources.length && chatStore.isSplash">
            <div class="flex items-center justify-center" :class="[isMobile ? 'mt-[8vh]' : 'mt-[16vh]']">
              <Splash v-if="!isFree" :random-prompt="randomPrompt" @fill-textarea="fillTextarea" />
              <OldSplash v-else :random-prompt="randomPrompt" @fill-textarea="fillTextarea" />
            </div>
          </template>
          <template v-if="!firstLoading && dataSources.length">
            <div :class="{ 'animate-in fade-in duration-500 ease-in': !isFree }">
              <Message
                v-for="(item, index) of dataSources"
                :key="index"
                :date-time="item.dateTime"
                :text="item.text"
                :images="item.images"
                :inversion="item.inversion"
                :response-count="item.responseCount"
                :usage="item && item.usage || undefined"
                :error="item.error"
                :loading="item.loading"
                @regenerate="onRegenerate(index)"
                @delete="handleDelete(index)"
                @response-history="(ev: number) => onResponseHistory(index, ev)"
              />
            </div>
          </template>
        </div>
      </div>
    </main>
    <footer :class="[isMobile ? 'p-2 pr-3' : 'p-4']">
      <div class="m-auto max-w-screen-xl" :class="[isMobile ? 'pl-1' : 'px-4']">
        <div v-if="isVisionModel && uploadFileKeysRef.length > 0" class="flex items-center space-x-2 h-10 pb-4">
          <NSpace>
            <img v-for="(v, i) of uploadFileKeysRef" :key="i" :src="`/uploads/${v}`" class="max-h-10">
            <HoverButton @click="handleDeleteUploadFile">
              <span class="text-xl text-[#4f555e] dark:text-white">
                <SvgIcon icon="ri:delete-back-2-fill" />
              </span>
            </HoverButton>
          </NSpace>
        </div>
        <div class="flex items-stretch space-x-2">
          <div class="relative flex-1">
            <NInput
              ref="inputRef"
              v-model:value="prompt"
              clearable
              class="pb-10"
              :disabled="!!authStore.session?.auth && !authStore.token && !authStore.session?.authProxyEnabled"
              type="textarea"
              :placeholder="t('chat.placeholderText')"
              :autosize="{ minRows: isMobile ? 1 : 1, maxRows: isMobile ? 4 : 8 }"
              :theme-overrides="inputThemeOverrides.Input"
              @keypress="handleEnter"
            />
            <div class="absolute bottom-2 left-2 right-2 cursor-text" @click="inputRef.focus()">
              <div class="flex items-center justify-between">
                <div v-if="!!authStore.token" class="flex items-center space-x-2 cursor-default" @click.stop>
                  <ToolButton :tooltip="!isMobile ? $t('chat.usingContext') : ''" placement="top" @click="handleToggleUsingContext">
                    <span class="text-xl" :class="{ 'text-[#22c55e]': usingContext, 'text-amber-500': !usingContext }">
                      <SvgIcon icon="fluent:brain-circuit-24-filled" />
                    </span>
                  </ToolButton>
                  <ToolButton>
                    <NUpload
                      :disabled="!isVisionModel"
                      action="/axiomnode/upload-image"
                      list-type="image"
                      class="flex items-center justify-center transition hover:bg-neutral-100 dark:hover:bg-[#414755]"
                      :headers="uploadHeaders"
                      :show-file-list="false"
                      response-type="json"
                      accept="image/png, image/jpeg, image/webp, image/gif"
                      @finish="handleFinish"
                    >
                      <span class="text-xl text-[#22c55e]">
                        <SvgIcon icon="ri:image-add-line" />
                      </span>
                    </NUpload>
                  </ToolButton>
                  <Speech v-if="!isMobile && speechStore.enable" />
                  <Voice v-if="!isMobile && speechStore.enable" :is-loading="loading" @on-change="handleVoiceChange" @reset="handleReset" @submit="handleVoiceSubmit" />
                </div>
                <div class="flex items-center cursor-default" @click.stop>
                  <div v-if="!!authStore.token && internetAccessEnabled" class="flex items-center text-neutral-400">
                    <NTooltip :style="{ maxWidth: '300px' }" trigger="hover">
                      <template #trigger>
                        <SvgIcon icon="ri:question-line" />
                      </template>
                      {{ $t('chat.internetAccessTip') }}
                    </NTooltip>
                    <span class="ml-1 mr-2 text-xs select-none">{{ $t('chat.internetAccess') }}</span>
                    <NSwitch size="small" disabled />
                    <NDivider vertical />
                  </div>
                  <NButton v-if="!loading" circle :disabled="buttonDisabled" @click="handleSubmit">
                    <template #icon>
                      <SvgIcon icon="ri:send-plane-fill" />
                    </template>
                  </NButton>
                  <NButton v-else strong secondary circle type="error" @click="handleStop">
                    <template #icon>
                      <SvgIcon icon="ri:stop-circle-line" />
                    </template>
                  </NButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="chatFooterEnabled" class="text-center text-xs text-black/60 dark:text-white/50 mt-2" v-html="chatFooterText" />
      </div>
    </footer>
  </div>
</template>
