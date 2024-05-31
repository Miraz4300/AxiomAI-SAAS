<script setup lang='ts'>
import { computed } from 'vue'
import { UserAvatar, UserRole } from '@/components/common'
import { useUserStore } from '@/store'
import { isString } from '@/utils/is'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex">
      <UserAvatar />
    </div>
    <div class="flex-1 min-w-0 ml-2 select-none">
      <div class="flex gap-1">
        <h2 v-if="userInfo.name" class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
          {{ userInfo.name }}
        </h2>
        <UserRole :only-tag="true" />
      </div>
      <p class="overflow-hidden text-xs text-neutral-500 text-ellipsis whitespace-nowrap">
        <span v-if="isString(userInfo.title) && userInfo.title !== ''" v-html="userInfo.title" />
      </p>
    </div>
  </footer>
</template>
