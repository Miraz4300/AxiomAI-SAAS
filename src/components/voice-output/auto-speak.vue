<script setup lang="ts">
import { SvgIcon, ToolButton } from '@/components/common'
import { useSpeechStore } from '@/store/modules/speech'
import { useSpeak } from '@/components/voice-output/use-speak'

const ttsStore = useSpeechStore()
const { cancelSpeak } = useSpeak()

function handleUpdate() {
  ttsStore.updateStore({ autoSpeak: !ttsStore.autoSpeak })
  if (ttsStore.autoSpeak) {
    window.$message?.success('Speech Synthesis: on')
  }
  else {
    window.$message?.warning('Speech Synthesis: off')
    cancelSpeak()
  }
}
</script>

<script lang="ts">
export default {
  name: 'AutoSpeak',
}
</script>

<template>
  <ToolButton :tooltip="$t('chat.speech')" placement="top">
    <span class="text-xl" :class="{ 'text-[#22c55e]': ttsStore.autoSpeak, 'text-amber-500': !ttsStore.autoSpeak }">
      <SvgIcon icon="ri:voice-recognition-line" @click="handleUpdate" />
    </span>
  </ToolButton>
</template>
