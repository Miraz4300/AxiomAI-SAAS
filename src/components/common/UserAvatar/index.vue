<script setup lang='ts'>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { useUserStore } from '@/store'
import { isString } from '@/utils/is'

const props = defineProps({
  size: {
    type: Number,
    default: 40,
  },
  avatarChange: {
    type: Boolean,
    default: false,
  },
})

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const defaultAvatar = '/assets/avatar_1.jpg'
const userAvatar = computed(() => {
  return isString(userInfo.value.avatar) && userInfo.value.avatar.length > 0 ? userInfo.value.avatar : defaultAvatar
})
</script>

<template>
  <div class="relative flex cursor-pointer rounded-full ring-0 ring-offset-2 drop-shadow-lg overflow-hidden">
    <NAvatar
      :size="props.size"
      round
      :src="userAvatar"
      :fallback-src="defaultAvatar"
      class="relative z-10"
    />
    <div v-if="props.avatarChange" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-200 z-20">
      Change Avatar
    </div>
  </div>
</template>
