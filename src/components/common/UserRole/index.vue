<script setup lang='ts'>
import { computed } from 'vue'
import { NTag } from 'naive-ui'
import { UserRole } from '@/components/admin/model'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
</script>

<template>
  <NTag v-if="userInfo.roles.length > 0" size="small" :bordered="false" type="success">
    {{ UserRole[userInfo.roles[0]] }}
  </NTag>
</template>
