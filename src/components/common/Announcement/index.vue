<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { NButton } from 'naive-ui'
import type { AnnouncementConfig } from '@/components/admin/model'
import { fetchUserAnnouncement } from '@/api'

const announcementConfig = ref<AnnouncementConfig>()
const userMessage = ref<string>('')

// Prevent showing the notification multiple times in a day
const lastShownDate = localStorage.getItem('lastShownDate')
const lastShownMessage = localStorage.getItem('lastShownMessage')
const currentDate = new Date().toISOString().slice(0, 10)
const diffInDays = Math.ceil((new Date(currentDate).getTime() - (new Date(lastShownDate || 0).getTime())) / (1000 * 60 * 60 * 24))

// For announcement
function showAnnouncement() {
  window.$notification?.create({
    title: announcementConfig.value?.announceHeader,
    // Render the content as a div with dark background. Reason(bug): conflicting with other css styles
    content: () => h('div', { class: 'dark:bg-[#1D242D]', innerHTML: announcementConfig.value?.announceBody }),
    meta: announcementConfig.value?.announceFooter,
    duration: 10000, // 10 seconds
    keepAliveOnHover: true,
  })
}

// For user notification message
function showMessage() {
  if (userMessage.value) {
    const n = window.$notification!.create({
      title: 'Message',
      // Render the content as a div with dark background. Reason(bug): conflicting with other css styles
      content: () => h('div', { class: 'dark:bg-[#1D242D]', innerHTML: userMessage.value }),
      meta: 'From admin',
      action: () => h(NButton, { text: true, type: 'primary', onClick: () => { n.destroy() } }, 'Mark as Read'),
      duration: 25000, // 25 seconds
      keepAliveOnHover: true,
    })
  }
}

async function fetchData() {
  // Check if either announcement or notification has been shown
  if (diffInDays >= 2 || lastShownMessage !== currentDate) {
    const response = await fetchUserAnnouncement<{
      userMessage: string
      announcementConfig: AnnouncementConfig
    }>()

    if (response.data) {
      announcementConfig.value = response.data.announcementConfig
      userMessage.value = response.data.userMessage

      if (diffInDays >= 2 && announcementConfig.value?.announceEnabled) {
        setTimeout(() => {
          localStorage.setItem('lastShownDate', currentDate)
          showAnnouncement()
        }, 3000)
      }

      if (lastShownMessage !== currentDate && userMessage.value) {
        setTimeout(() => {
          localStorage.setItem('lastShownMessage', currentDate)
          showMessage()
        }, 5000)
      }
    }
  }
}

onMounted(fetchData)
</script>
