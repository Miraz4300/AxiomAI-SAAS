<script setup lang='ts'>
import { NLayoutHeader, useDialog, useMessage } from 'naive-ui'
import { computed, nextTick, ref } from 'vue'
import html2canvas from 'html2canvas'
import { useRoute } from 'vue-router'
import { useAppStore, useChatStore } from '@/store'
import { SvgIcon, ToolButton } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'

const appStore = useAppStore()
const chatStore = useChatStore()

const route = useRoute()
const dialog = useDialog()
const ms = useMessage()
const loading = ref<boolean>(false)
const { uuid } = route.params as { uuid: string }
const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)
const { isMobile } = useBasicLayout()

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

function onScrollToTop() {
  const scrollRef = document.querySelector('#scrollRef')
  if (scrollRef)
    nextTick(() => scrollRef.scrollTop = 0)
}
</script>

<template>
  <NLayoutHeader bordered :class="[isMobile ? 'bg-white/80 dark:bg-black/20' : '']">
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
        <span class="flex-1 overflow-hidden cursor-pointer select-none text-ellipsis whitespace-nowrap" @dblclick="onScrollToTop">
          {{ currentChatHistory?.title ?? '' }}
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <ToolButton :tooltip="$t('chat.exportImage')" @click="handleExport">
          <span class="text-xl text-[#4f555e] dark:text-white">
            <SvgIcon icon="mdi:file-export-outline" />
          </span>
        </ToolButton>
        <ToolButton :tooltip="$t('chat.deleteMessage')" @click="handleClear">
          <span class="text-xl text-[#4f555e] dark:text-white">
            <SvgIcon icon="ri:delete-bin-line" />
          </span>
        </ToolButton>
      </div>
    </div>
  </NLayoutHeader>
</template>
