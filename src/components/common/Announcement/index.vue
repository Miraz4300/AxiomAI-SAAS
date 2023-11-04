<script setup lang='ts'>
import { NModal, NScrollbar } from 'naive-ui'
import { onMounted, ref } from 'vue'
import type { AnnouncementConfig } from '@/components/admin/model'
import { fetchUserAnnouncement } from '@/api'

const show = ref(false)
const announcementConfig = ref<AnnouncementConfig>()

onMounted(async () => {
  // Prevent showing the modal multiple times in a day
  const lastShownDate = localStorage.getItem('lastShownDate')
  const currentDate = new Date().toISOString().slice(0, 10)

  if (lastShownDate === currentDate)
    return

  const response = await fetchUserAnnouncement<AnnouncementConfig>()
  announcementConfig.value = response.data

  if (announcementConfig.value?.announceEnabled) {
    setTimeout(() => {
      localStorage.setItem('lastShownDate', currentDate)
      show.value = true
    }, 3000) // 3 seconds delay to show the modal
  }
})
</script>

<template>
  <NModal v-model:show="show" :auto-focus="false" :mask-closable="true" preset="card" style="width: 95%; max-width: 600px; max-height: 640px" :title="announcementConfig?.announceHeader">
    <NScrollbar style="max-height: 510px">
      <div class="pl-4 pr-4" v-html="announcementConfig?.announceBody" />
    </NScrollbar>
    <template #footer>
      {{ announcementConfig?.announceFooter }}
    </template>
  </NModal>
</template>
