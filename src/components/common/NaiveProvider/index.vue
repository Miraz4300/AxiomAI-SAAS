<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { NDialogProvider, NLoadingBarProvider, NMessageProvider, NNotificationProvider, useDialog, useLoadingBar, useMessage, useNotification } from 'naive-ui'
import { useTheme } from '@/hooks/useTheme'

function registerNaiveTools() {
  window.$loadingBar = useLoadingBar()
  window.$dialog = useDialog()
  window.$message = useMessage()
  window.$notification = useNotification()
}

const { naiveCustom } = useTheme()

const NaiveProviderContent = defineComponent({
  name: 'NaiveProviderContent',
  setup() {
    registerNaiveTools()
  },
  render() {
    return h('div')
  },
})
</script>

<template>
  <NLoadingBarProvider>
    <NDialogProvider>
      <NNotificationProvider :theme-overrides="naiveCustom.Border">
        <NMessageProvider :theme-overrides="naiveCustom.Border">
          <slot />
          <NaiveProviderContent />
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NLoadingBarProvider>
</template>
