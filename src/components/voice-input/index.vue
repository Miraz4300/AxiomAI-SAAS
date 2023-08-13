<script setup lang='ts'>
import { computed, onUnmounted, ref } from 'vue'
import { NAlert, NDescriptions, NDescriptionsItem, NModal, useMessage } from 'naive-ui'
import { commandType, deleteLast, emptySentences, getCmdKey, getLanguage, logger, replaceSymbol, tips } from './utils'
import { useSpeechObject } from './speech-object'
import { SvgIcon, ToolButton } from '@/components/common'
import { useSpeechStore } from '@/store/modules/speech'

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

interface Props {
  isLoading: boolean
}

interface Emit {
  (ev: 'onChange', value: string[]): void
  (ev: 'reset'): void
  (ev: 'submit'): void
}

const speechStore = useSpeechStore()
const enableVoice = ref(false)
const isShowModal = ref(false)
const voiceIcon = computed(() => enableVoice.value ? 'material-symbols:auto-detect-voice-outline' : 'ic:round-keyboard-voice')
const sentences = ref<string[]>([])
const language = ref('en-US')
const showTip = ref(false)
const { getSpeechObject } = useSpeechObject()

let recognition: any = null
const message = useMessage()

window.loggerDebugger = (msg: string) => {
  if (location.search.includes('debugger'))
    message.error(msg)
}

function changeEnableVoice() {
  enableVoice.value = !enableVoice.value

  if (enableVoice.value) {
    if (isShowModal.value || !speechStore.showTip)
      startRecording()
    else
      showTip.value = true
  }
  else {
    stopRecording()
  }
}
async function initRecognition() {
  const { SpeechRecognition } = await getSpeechObject()
  if (!SpeechRecognition) {
    message.warning('The current browser does not support voice function!')
    return
  }

  recognition = new SpeechRecognition()
  // recognition = new NativeSpeechRecognition()
  recognition.interimResults = true // Turn on real-time recognition
  recognition.continuous = true
  recognition.onstart = () => logger('init recognition')
  recognition.onerror = (e: any) => {
    logger('Misidentified!')
    window.loggerDebugger(e?.error?.toString() ?? e.toString())
  }
  recognition.onend = () => {
    logger('Why was it terminated?')
    changeEnableVoice()
  }

  handleRecognitionResult()
}
async function startRecording() {
  if (!recognition)
    await initRecognition()

  if (recognition) {
    sentences.value = [] // clear existing sentences
    recognition.lang = language.value
    recognition.start()
    message.success('Voice on!')
  }
}
// end recording
function stopRecording() {
  sentences.value = []
  if (!recognition)
    return
  // recognition.stop() // stop recording
  recognition.abort() // stop recording
  recognition.onstart = null
  recognition.onerror = null
  recognition.onend = null
  recognition.onresult = null
  recognition = null
  logger('stop voice')
  message.warning('Voice off!')
}
// Monitor speech recognition results
function handleRecognitionResult() {
  recognition.onresult = (event: any) => {
    // event.resultIndex is the completed sentence judged by the system, and it will switch to the next sentence after stopping the comparison
    const resultIndex = event.resultIndex === undefined ? event.results.length - 1 : event.resultIndex
    const resultItem = event.results?.[resultIndex]
    const interimTranscript = (resultItem?.[0]?.transcript || '')
      .replace(/[&/\\#,+()!$~%.'":*?<>{}]/g, '')
      .replace(/[。]/g, '')
      .replace(/  +/g, ' ')

    let resStr = replaceSymbol(interimTranscript)
    const { cmdKey, str: newStr = resStr } = getCmdKey(resStr) || {}
    resStr = newStr

    // The resultIndex of the latest sentence remains unchanged
    sentences.value.splice(resultIndex, 1, resStr)
    emit('onChange', sentences.value)
    logger(`current number[${resultIndex}]sentence, record${sentences.value.length}sentence, cmdKey: ${cmdKey}, isFinal:${resultItem?.isFinal}`, resStr)

    switch (cmdKey) {
      case commandType.clear:
        emptySentences(sentences)
        break
      case commandType.deleteLast:
        resultItem.isFinal && deleteLast({ str: resStr, sentences })
        break
      case commandType.reset:
        emptySentences(sentences)
        emit('reset')
        break
      case commandType.stop:
        changeEnableVoice()
        break
      case commandType.submit:
        if (!props.isLoading && resultItem.isFinal) {
          emit('submit')
          emptySentences(sentences)
        }
        break
      case commandType.switchLang:
        switchLang(getLanguage(interimTranscript))
        break
      default:
    }
    emit('onChange', sentences.value)
  }
}
function switchLang(lang?: string) {
  if (lang) {
    language.value = lang
    changeEnableVoice()
    setTimeout(() => {
      changeEnableVoice()
    }, 1000)
  }
}

function onNegativeClick() {
  speechStore.updateStore({ showTip: false })
  showTip.value = false
  isShowModal.value = true
  startRecording()
}
function onPositiveClick() {
  showTip.value = false
  isShowModal.value = true
  startRecording()
}
onUnmounted(() => changeEnableVoice())
</script>

<script lang='ts'>
export default {
  name: 'VoiceInput',
}
</script>

<template>
  <ToolButton>
    <span class="text-xl" :class="{ 'text-[#22c55e]': enableVoice, 'text-amber-500': !enableVoice }">
      <SvgIcon :icon="voiceIcon" @click="changeEnableVoice" />
    </span>
  </ToolButton>
  <NModal
    v-model:show="showTip"
    style="width: 75%; max-width: 570px;"
    preset="dialog"
    title="Voice Input Tips"
    :mask-closable="false"
    positive-text="OK"
    negative-text="don't show again"
    :closable="false"
    :close-on-esc="false"
    @positive-click="onPositiveClick"
    @negative-click="onNegativeClick"
  >
    <NAlert type="info" :show-icon="false" :bordered="false" title="Instructions">
      When voice function is enabled, you can input content by voice and chat with AxiomAI.
      Additionally these commands are available. For Example:
    </NAlert>
    <br>
    <NDescriptions label-placement="left" bordered size="small" :column="1" style="max-height: 45vh; overflow: auto">
      <NDescriptionsItem v-for="item in tips" :key="item.label" label-style="width: 80px">
        <template #label>
          {{ item.label }}
        </template>
        {{ item.value }}
      </NDescriptionsItem>
    </NDescriptions>
  </NModal>
</template>
