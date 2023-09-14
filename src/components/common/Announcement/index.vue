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
  const response = await fetchUserAnnouncement<AnnouncementConfig>()
  if (response.data) {
    announceHeader.value = response.data.announceHeader || 'Loading...'
    announceBody.value = response.data.announceBody || 'Loading...'
    announceFooter.value = response.data.announceFooter || 'Loading...'

    show.value = announceBody.value.length > 20
  }
})
</script>

<template>
  <NModal v-model:show="show" :auto-focus="false" :mask-closable="true" preset="card" style="width: 95%; max-width: 640px; max-height: 640px" :title="announceHeader">
    <NScrollbar style="max-height: 500px">
      <div class="pl-4 pr-4" v-html="announceBody" />
    </NScrollbar>
    <template #footer>
      {{ announceFooter }}
    </template>
  </NModal>
</template>
