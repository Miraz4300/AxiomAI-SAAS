<script setup lang='ts'>
import { computed } from 'vue'
import { NTag } from 'naive-ui'
import { UserRole } from '@/components/admin/model'
import { SvgIcon } from '@/components/common'
import { useUserStore } from '@/store'

const props = defineProps({
  subLink: {
    type: Boolean,
    default: false,
  },
})

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const Role = userInfo.value.roles[0]

function TagType(role: UserRole) {
  if (role === UserRole.Premium)
    return 'success'
  if (role === UserRole.MVP)
    return 'warning'
  if (role === UserRole.Support)
    return 'info'
  return 'default'
}

function IconName(role: UserRole) {
  if (role === UserRole.Premium)
    return 'ri:vip-diamond-fill'
  if (role === UserRole.MVP)
    return 'ri:award-fill'
  if (role === UserRole.Support)
    return 'ri:hearts-fill'
  return ''
}

const Tag = computed(() => TagType(Role))
const Icon = computed(() => IconName(Role))
</script>

<template>
  <NTag v-if="userInfo.roles.length > 0" size="small" :bordered="false" :type="Tag" class="font-semibold">
    {{ UserRole[userInfo.roles[0]] }}
    <template v-if="Icon" #icon>
      <SvgIcon :icon="Icon" />
    </template>
  </NTag>
  <div v-if="props.subLink && Role === UserRole.Free" class="text-[#fb923c]">
    <a href="https://forms.office.com/r/2Z1fz0NhgE" target="_blank" rel="noreferrer">Buy subscription here</a>
  </div>
</template>
