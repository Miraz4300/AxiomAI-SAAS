<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { useNotification } from 'naive-ui'
import type { AnnouncementConfig } from '@/components/admin/model'
import { fetchUserAnnouncement } from '@/api'

const notification = useNotification()
const announcementConfig = ref<AnnouncementConfig>()
const userMessage = ref<string>('')

// Prevent showing the notification multiple times in a day
const lastShownDate = localStorage.getItem('lastShownDate')
const lastShownMessage = localStorage.getItem('lastShownMessage')
const currentDate = new Date().toISOString().slice(0, 10)

// For announcement
function showNotification() {
  notification.create({
    title: announcementConfig.value?.announceHeader,
    // Render the content as a div with dark background as it is conflicting with other css styles
    content: () => h('div', { class: 'dark:bg-[#1B2129]', innerHTML: announcementConfig.value?.announceBody }),
    meta: announcementConfig.value?.announceFooter,
    duration: 10000,
    keepAliveOnHover: true,
  })
}

// For user message
function showMessage() {
  if (userMessage.value) {
    notification.create({
      title: 'Message',
      // Render the content as a div with dark background as it is conflicting with other css styles
      content: () => h('div', { class: 'dark:bg-[#1B2129]', innerHTML: userMessage.value }),
      meta: '',
      duration: 60000,
      keepAliveOnHover: true,
    })
  }
}

async function fetchData() {
  // Check if either message or notification has been shown today
  if (lastShownDate !== currentDate || lastShownMessage !== currentDate) {
    const response = await fetchUserAnnouncement<{
      userMessage: string
      announcementConfig: AnnouncementConfig
    }>()

    if (response.data) {
      announcementConfig.value = response.data.announcementConfig
      userMessage.value = response.data.userMessage

      if (lastShownDate !== currentDate && announcementConfig.value?.announceEnabled) {
        setTimeout(() => {
          localStorage.setItem('lastShownDate', currentDate)
          showNotification()
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
