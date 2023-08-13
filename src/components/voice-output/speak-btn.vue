<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSpeak } from './use-speak'
import { SvgIcon } from '@/components/common'
import { useSpeechStore } from '@/store/modules/speech'

interface Props {
  text?: string
  loading?: boolean
}
const props = defineProps<Props>()
const initText = ref(props.text)
const isSpeaked = ref(false)
const ttsStore = useSpeechStore()

const { speak, isSpeaking, cancelSpeak } = useSpeak()
const voiceIcon = computed(() => isSpeaking.value
  ? 'svg-spinners:bars-scale-middle'
  : 'ri:voice-recognition-line')

function handleSpeak() {
  if (props.loading)
    return

  if (isSpeaking.value) {
    cancelSpeak()
  }
  else {
    isSpeaked.value = true
    speak(props.text)
  }
}

watch([() => props.loading, () => ttsStore.autoSpeak], ([loading, autoSpeak], [preLoading]) => {
  if (initText.value !== props.text // The newly loaded text will be different
    && autoSpeak && !loading && !isSpeaked.value) {
    isSpeaked.value = true
    handleSpeak()
  }
})
</script>

<script lang='ts'>
export default {
  name: 'SpeakBtn',
}
</script>

<template>
  <div v-if="text?.length" :class="isSpeaking ? 'text-green-400' : ''">
    <SvgIcon :icon="voiceIcon" @click="handleSpeak" />
  </div>
</template>
