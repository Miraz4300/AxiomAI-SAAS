<script setup lang='ts'>
import { computed } from 'vue'
import { NTag } from 'naive-ui'
import { UserAvatar } from '@/components/common'
import { UserRole } from '@/components/admin/model'
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
    <div class="flex-1 min-w-0 ml-2">
      <div class="flex gap-1">
        <h2 v-if="userInfo.name" class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
          {{ userInfo.name }}
        </h2>
        <NTag v-if="userInfo.roles.length > 0" size="small" :bordered="false" type="success">
          {{ UserRole[userInfo.roles[0]] }}
        </NTag>
      </div>
      <p class="overflow-hidden text-xs text-neutral-500 text-ellipsis whitespace-nowrap">
        <span v-if="isString(userInfo.description) && userInfo.description !== ''" v-html="userInfo.description" />
      </p>
    </div>
  </footer>
</template>
