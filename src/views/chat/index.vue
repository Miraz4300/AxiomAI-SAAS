<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { MessageReactive } from 'naive-ui'
import { NAutoComplete, NButton, NDivider, NInput, NSpin, NSwitch, NTooltip, useDialog, useMessage } from 'naive-ui'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import Header from './components/Header/index.vue'
import { SvgIcon, ToolButton } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore, useChatStore, usePromptStore, useUserStore } from '@/store'
import type { FeaturesConfig } from '@/components/admin/model'
import { fetchChatAPIProcess, fetchChatResponseoHistory, fetchChatStopResponding, fetchUserFeatures } from '@/api'
import { t } from '@/locales'
import { useSpeechStore } from '@/store/modules/speech'
import { debounce } from '@/utils/functions/debounce'

let controller = new AbortController()
let lastChatInfo: any = {}

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const route = useRoute()
const dialog = useDialog()
const ms = useMessage()
const authStore = useAuthStore()
const userStore = useUserStore()
const chatStore = useChatStore()
const speechStore = useSpeechStore()

const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom, scrollTo } = useScroll()

const { uuid } = route.params as { uuid: string }

const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)
const usingContext = computed(() => currentChatHistory?.value?.usingContext ?? true)
const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))

const chatFooterEnabled = ref<boolean | null>(null)
const chatFooterText = ref<string | null>(null)

const prompt = ref<string>('')
const firstLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)

let loadingms: MessageReactive
let allmsg: MessageReactive
let prevScrollTop: number

const promptStore = usePromptStore()
const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

// If the page is refreshed for unknown reasons, the loading status will not be reset, so it can be reset manually.
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(+uuid, index, { loading: false })
})

// Generate random prompt text for example buttons
const promptText: any[] = []
for (let i = 1; i <= 15; i++)
  promptText.push(t(`chat.text${i}`))

function getRandomUniqueIndices(length: number, count: number) {
  const indices = new Set<number>()
  while (indices.size < count)
    indices.add(Math.floor(Math.random() * length))
  return Array.from(indices)
}

const randomPrompt = getRandomUniqueIndices(promptText.length, 3)

function fillTextarea(text: string) {
  if (authStore.session?.auth && authStore.token)
    prompt.value = text
}

function handleSubmit() {
  onConversation()
}

async function onConversation() {
  let message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  const chatUuid = Date.now()
  addChat(
    +uuid,
    {
      uuid: chatUuid,
      dateTime: new Date().toLocaleString(),
      text: message,
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
      text: 'thinking',
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
      text: 'rethinking',
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

// Build-in prompt
const searchOptions = computed(() => {
  if (prompt.value.startsWith('/')) {
    return promptTemplate.value.filter((item: { key: string }) => item.key.toLowerCase().includes(prompt.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
      return {
        label: obj.value,
        value: obj.value,
      }
    })
  }
  else {
    return []
  }
})

// value inverse rendering key
function renderOption(option: { label: string }) {
  for (const i of promptTemplate.value) {
    if (i.value === option.label)
      return [i.key]
  }
  return []
}

const placeholderText = ref<string>('')
// Generate typing effect for placeholder text
function generateTypingEffect() {
  const randomText = promptText[Math.floor(Math.random() * promptText.length)]
  let index = 0
  let direction = 1

  const intervalId = setInterval(() => {
    placeholderText.value = randomText.substring(0, index)
    index += direction

    if (index > randomText.length) {
      setTimeout(() => {
        direction = -1
      }, 20000) // Wait 40 seconds before erasing text
    }
    else if (index < 0) {
      clearInterval(intervalId)
      setTimeout(generateTypingEffect, 0) // Show next text immediately after erasing
    }
  }, 30) // Adjust speed based of typing and erasing
}

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})

function handleVoiceChange(v: string[]) {
  prompt.value = v.filter(item => !!item).join('')
}
const handleReset = () => chatStore.clearChatByUuid(+uuid)
function handleVoiceSubmit() {
  if (!loading.value)
    handleSubmit()
}

onMounted(() => {
  firstLoading.value = true
  handleSyncChat()

  if (authStore.token) {
    const chatModels = authStore.session?.chatModels
    if (chatModels != null && chatModels.filter(d => d.value === userStore.userInfo.config.chatModel).length <= 0)
      ms.error('The selected model doesn\'t exist, please choose another.', { duration: 4000 })
  }
  generateTypingEffect()
})

onMounted(async () => {
  const response = await fetchUserFeatures<FeaturesConfig>()
  chatFooterEnabled.value = response.data.chatFooterEnabled || false
  chatFooterText.value = response.data.chatFooterText || ''
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
const Announcement = defineAsyncComponent(() => import('@/components/common/Announcement/index.vue'))
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <Header />
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto" @scroll="handleScroll">
        <div id="image-wrapper" class="w-full max-w-screen-2xl m-auto dark:bg-[#111114]" :class="[isMobile ? 'p-2' : 'p-4']">
          <NSpin :show="firstLoading">
            <template v-if="!dataSources.length">
              <div class="flex items-center justify-center" :class="[isMobile ? 'mt-[8vh]' : 'mt-[16vh]']">
                <!-- AxiomAI is being introduced. -->
                <div class="text-gray-800 w-full md:max-w-2xl lg:max-w-3xl md:h-full md:flex md:flex-col px-6 dark:text-gray-100">
                  <h1 class="text-4xl font-semibold text-center select-none ml-auto mr-auto mb-10 sm:mb-16 flex gap-2 items-center justify-center">
                    AxiomAI<a class="text-sm bg-[#ECEEF1] dark:bg-white/5 py-1 px-2 rounded-md">preview</a>
                  </h1><div class="md:flex items-start text-center gap-3.5">
                    <div class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
                      <h2 class="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2 select-none">
                        <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>Examples
                      </h2><ul class="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
                        <button class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md animate-in fade-in zoom-in-50 hover:bg-[#67e8f9] dark:hover:bg-[#06b6d4] transition hover:scale-105 shadow-md shadow-cyan-500/50" @click="fillTextarea(promptText[randomPrompt[0]])">
                          {{ promptText[randomPrompt[0]] }} →
                        </button>
                        <button class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md animate-in delay-50 fade-in zoom-in-50 hover:bg-[#60a5fa] dark:hover:bg-[#3b82f6] transition hover:scale-105 shadow-md shadow-blue-500/50" @click="fillTextarea(promptText[randomPrompt[1]])">
                          {{ promptText[randomPrompt[1]] }} →
                        </button>
                        <button class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md animate-in delay-100 fade-in zoom-in-50 hover:bg-[#818cf8] dark:hover:bg-[#6366f1] transition hover:scale-105 shadow-md shadow-indigo-500/50" @click="fillTextarea(promptText[randomPrompt[2]])">
                          {{ promptText[randomPrompt[2]] }} →
                        </button>
                      </ul>
                    </div><div class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
                      <h2 class="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2 select-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="h-6 w-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>Capabilities
                      </h2><ul class="flex flex-col gap-3.5 w-full sm:max-w-md m-auto select-none">
                        <li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
                          Remembers what user said earlier in the conversation
                        </li><li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
                          Allows user to provide follow-up corrections
                        </li><li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
                          Trained to decline inappropriate requests
                        </li>
                      </ul>
                    </div><div class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
                      <h2 class="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2 select-none">
                        <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>Limitations
                      </h2><ul class="flex flex-col gap-3.5 w-full sm:max-w-md m-auto select-none">
                        <li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
                          May occasionally generate incorrect information
                        </li><li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
                          May occasionally produce harmful instructions or biased content
                        </li><li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
                          Limited knowledge of world and events after 2021
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <!-- End of introduction. -->
              </div>
            </template>
            <template v-else>
              <div>
                <Message
                  v-for="(item, index) of dataSources"
                  :key="index"
                  :date-time="item.dateTime"
                  :text="item.text"
                  :inversion="item.inversion"
                  :response-count="item.responseCount"
                  :usage="item && item.usage || undefined"
                  :error="item.error"
                  :loading="item.loading"
                  @regenerate="onRegenerate(index)"
                  @delete="handleDelete(index)"
                  @response-history="(ev: number) => onResponseHistory(index, ev)"
                />
                <div class="sticky bottom-0 left-0 flex justify-center">
                  <NButton v-if="loading" ghost @click="handleStop">
                    <template #icon>
                      <SvgIcon icon="ri:stop-circle-line" />
                    </template>
                    Stop Responding
                  </NButton>
                </div>
              </div>
            </template>
          </NSpin>
        </div>
      </div>
    </main>
    <footer :class="footerClass">
      <div class="m-auto max-w-screen-2xl" :class="[isMobile ? 'pl-1' : 'px-4']">
        <div class="flex items-stretch space-x-2">
          <div class="relative flex-1">
            <NAutoComplete v-model:value="prompt" :options="searchOptions" :render-label="renderOption" placement="top">
              <template #default="{ handleInput, handleBlur, handleFocus }">
                <NInput
                  ref="inputRef"
                  v-model:value="prompt"
                  clearable
                  class="pb-10"
                  :disabled="!!authStore.session?.auth && !authStore.token"
                  type="textarea"
                  :placeholder="placeholderText"
                  :autosize="{ minRows: isMobile ? 1 : 2, maxRows: isMobile ? 4 : 8 }"
                  @input="handleInput"
                  @focus="handleFocus"
                  @blur="handleBlur"
                  @keypress="handleEnter"
                />
              </template>
            </NAutoComplete>
            <div class="absolute bottom-2 left-2 right-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <ToolButton :tooltip="!isMobile ? $t('chat.usingContext') : ''" placement="top" @click="handleToggleUsingContext">
                    <span class="text-xl" :class="{ 'text-[#22c55e]': usingContext, 'text-amber-500': !usingContext }">
                      <SvgIcon icon="fluent:brain-circuit-24-filled" />
                    </span>
                  </ToolButton>
                  <Speech v-if="!isMobile && speechStore.enable" />
                  <Voice v-if="!isMobile && speechStore.enable" :is-loading="loading" @on-change="handleVoiceChange" @reset="handleReset" @submit="handleVoiceSubmit" />
                </div>
                <div class="flex items-center">
                  <div class="flex items-center text-neutral-400">
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
                  <NButton circle :disabled="buttonDisabled" @click="handleSubmit">
                    <template #icon>
                      <SvgIcon icon="ri:send-plane-fill" />
                    </template>
                  </NButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="chatFooterEnabled" class="text-center text-xs text-black/60 dark:text-white/50 mt-2" v-html="chatFooterText" />
    </footer>
  </div>
  <Announcement />
</template>
