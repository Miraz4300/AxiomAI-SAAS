<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import { NDropdown, useDialog, useMessage } from 'naive-ui'
import html2canvas from 'html2canvas'
import { ref } from 'vue'
import { SvgIcon, ToolButton } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { getCurrentDate } from '@/utils/functions'
import { t } from '@/locales'

const loading = ref<boolean>(false)
const { isMobile } = useBasicLayout()
const ms = useMessage()
const dialog = useDialog()

function exportJSON() {
  if (loading.value)
    return

  const d = dialog.info({
    title: t('chat.exportJSON'),
    content: t('chat.exportJSONConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const date = getCurrentDate()
        const data: string = localStorage.getItem('chatStorage') || '{}'
        const jsonString: string = JSON.stringify(JSON.parse(data), null, 2)
        const blob: Blob = new Blob([jsonString], { type: 'application/json' })
        const url: string = URL.createObjectURL(blob)
        const link: HTMLAnchorElement = document.createElement('a')
        link.href = url
        link.download = `axiomai_history_${date}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
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

function exportPNG() {
  if (loading.value)
    return

  const d = dialog.info({
    title: t('chat.exportPNG'),
    content: t('chat.exportPNGConfirm'),
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

const options: DropdownOption[] = [
  {
    label: 'Export as JSON',
    key: 'json',
  },
  {
    type: 'divider',
    key: 'divider',
  },
  {
    label: 'Export as image',
    key: 'image',
  },
]

type DropdownKey = 'json' | 'image'

function handleDropdown(optionKey: string) {
  const key = optionKey as DropdownKey
  if (key === 'json')
    exportJSON()
  else if (key === 'image')
    exportPNG ()
}
</script>

<template>
  <NDropdown trigger="click" :options="options" @select="handleDropdown">
    <ToolButton :tooltip=" !isMobile ? $t('chat.exportChat') : ''">
      <SvgIcon class="text-xl" icon="ri:file-download-line" />
    </ToolButton>
  </NDropdown>
</template>
