<script setup lang='ts'>
import { NModal, NScrollbar } from 'naive-ui'
import { onMounted, ref } from 'vue'
import type { AnnouncementConfig } from '@/components/admin/model'
import { fetchUserAnnouncement } from '@/api'

const show = ref(false)

const announceHeader = ref('')
const announceBody = ref('')
const announceFooter = ref('')

onMounted(async () => {
  // Simulate a 3-second delay before showing the modal
  setTimeout(async () => {
    const response = await fetchUserAnnouncement<AnnouncementConfig>()
    if (response.data) {
      announceHeader.value = response.data.announceHeader || 'Loading...'
      announceBody.value = response.data.announceBody || 'Loading...'
      announceFooter.value = response.data.announceFooter || 'Loading...'

      show.value = announceBody.value.length > 20
    }
  }, 3000)
})
</script>

<template>
  <NModal v-model:show="show" :auto-focus="false" :mask-closable="true" preset="card" style="width: 95%; max-width: 600px; max-height: 640px" :title="announceHeader">
    <NScrollbar style="max-height: 510px">
      <div class="pl-4 pr-4" v-html="announceBody" />
    </NScrollbar>
    <template #footer>
      {{ announceFooter }}
    </template>
  </NModal>
</template>
