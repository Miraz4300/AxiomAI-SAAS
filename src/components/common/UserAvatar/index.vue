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
})

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const defaultAvatar = '/assets/avatar_1.jpg'
</script>

<template>
  <div class="flex items-center drop-shadow-lg">
    <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
      <NAvatar
        :size="props.size"
        round
        :src="userInfo.avatar"
        :fallback-src="defaultAvatar"
      />
    </template>
    <template v-else>
      <NAvatar :size="props.size" round :src="defaultAvatar" />
    </template>
  </div>
</template>
