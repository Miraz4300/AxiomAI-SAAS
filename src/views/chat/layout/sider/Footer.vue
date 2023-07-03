<script setup lang='ts'>
import { computed } from 'vue'
import { UserAvatar } from '@/components/common'
import { useAuthStore, useUserStore } from '@/store'
import { isString } from '@/utils/is'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const { isMobile } = useBasicLayout()
const authStore = useAuthStore()
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div v-if="isMobile" class="flex">
      <UserAvatar />
    </div>
    <div class="flex-1 min-w-0 ml-2">
      <h2 v-if="userInfo.name" class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
        {{ userInfo.name }}
      </h2>
      <NButton v-else tag="a" text>
        <span class="text-sm text-black dark:text-white">
          {{ authStore.session?.title }}
        </span>
      </NButton>
      <p class="overflow-hidden text-xs text-neutral-500 text-ellipsis whitespace-nowrap">
        <span v-if="isString(userInfo.description) && userInfo.description !== ''" v-html="userInfo.description" />
      </p>
    </div>
  </footer>
</template>
