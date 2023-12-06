<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { useNotification } from 'naive-ui'
import type { AnnouncementConfig } from '@/components/admin/model'
import { fetchUserAnnouncement } from '@/api'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const notification = useNotification()
const message = ref(userInfo.value.message ?? '')
const announcementConfig = ref<AnnouncementConfig>()

// Prevent showing the notification multiple times in a day
const lastShownDate = localStorage.getItem('lastShownDate')
const lastShownMessage = localStorage.getItem('lastShownMessage')
const currentDate = new Date().toISOString().slice(0, 10)

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

function showMessage() {
  notification.create({
    title: 'Message',
    content: () => {
      return h('div', { class: 'dark:bg-[#1B2129]', innerHTML: message.value })
    }, // Render the content as a div with dark background as it is conflicting with other css styles
    meta: '',
    duration: 60000,
    keepAliveOnHover: true,
  })
}

onMounted(async () => {
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

onMounted(async () => {
  if (lastShownMessage === currentDate)
    return

  if (message.value.length > 10) {
    setTimeout(() => {
      localStorage.setItem('lastShownMessage', currentDate)
      showMessage()
    }, 5000) // 5 seconds delay to show the notification
  }
})
</script>
