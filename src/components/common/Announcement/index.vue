<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { useNotification } from 'naive-ui'
import type { AnnouncementConfig } from '@/components/admin/model'
import { fetchUserAnnouncement } from '@/api'

const notification = useNotification()
const announcementConfig = ref<AnnouncementConfig>()

function showNotification() {
  notification.create({
    title: announcementConfig.value?.announceHeader,
    content: () => {
      return h('div', { class: 'dark:bg-[#1B2129]', innerHTML: announcementConfig.value?.announceBody })
    }, // Render the content as a div with dark background as it is conflicting with other css styles
    meta: announcementConfig.value?.announceFooter,
    duration: 10000,
    keepAliveOnHover: true,
  })
}

onMounted(async () => {
  // Prevent showing the notification multiple times in a day
  const lastShownDate = localStorage.getItem('lastShownDate')
  const currentDate = new Date().toISOString().slice(0, 10)

  if (lastShownDate === currentDate)
    return

  const response = await fetchUserAnnouncement<AnnouncementConfig>()
  announcementConfig.value = response.data

  if (announcementConfig.value?.announceEnabled) {
    setTimeout(() => {
      localStorage.setItem('lastShownDate', currentDate)
      showNotification()
    }, 3000) // 3 seconds delay to show the notification
  }
})
</script>
