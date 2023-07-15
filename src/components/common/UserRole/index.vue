<script setup lang='ts'>
import { computed } from 'vue'
import { NTag } from 'naive-ui'
import { UserRole } from '@/components/admin/model'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

function Tag(role: UserRole) {
  if (role === UserRole.Free)
    return 'default'
  else if (role === UserRole.Premium)
    return 'success'
  else if (role === UserRole.MVP)
    return 'warning'
  else if (role === UserRole.Support)
    return 'info'
  else
    return 'default'
}
</script>

<template>
  <NTag v-if="userInfo.roles.length > 0" size="small" :bordered="false" :type="Tag(userInfo.roles[0])">
    {{ UserRole[userInfo.roles[0]] }}
  </NTag>
</template>
