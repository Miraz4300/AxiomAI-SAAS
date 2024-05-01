<script setup lang='ts'>
import { computed } from 'vue'
import { NTag } from 'naive-ui'
import { useRouter } from 'vue-router'
import { UserRole } from '@/components/admin/model'
import { SvgIcon } from '@/components/common'
import { useUserStore } from '@/store'

const props = defineProps({
  subLink: {
    type: Boolean,
    default: false,
  },
  onlyTag: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: Boolean,
    default: true,
  },
})

const router = useRouter()

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const Role = userInfo.value.roles[0]

function goSub() {
  router.push('/settings?id=subscription')
}

function TagType(role: UserRole) {
  if (role === UserRole.Premium)
    return 'success'
  if (role === UserRole.MVP)
    return 'warning'
  if (role === UserRole.Support)
    return 'success'
  if (role === UserRole.Enterprise || role === UserRole.Admin)
    return 'error'
  if (role === UserRole.Basic)
    return 'info'
  if (role === UserRole['Basic+'])
    return 'info'
  return 'default'
}

function IconName(role: UserRole) {
  if (role === UserRole.Admin)
    return 'ri:admin-line'
  if (role === UserRole.Premium)
    return 'ri:vip-diamond-fill'
  if (role === UserRole.MVP)
    return 'ri:vip-crown-fill'
  if (role === UserRole.Support)
    return 'ri:hearts-fill'
  if (role === UserRole.Enterprise)
    return 'ri:building-fill'
  if (role === UserRole.Basic)
    return 'ri:quill-pen-fill'
  if (role === UserRole['Basic+'])
    return 'ri:briefcase-4-fill'
  return ''
}

const Tag = computed(() => TagType(Role))
const Icon = computed(() => IconName(Role))
</script>

<template>
  <div v-if="props.subLink" class="flex flex-col bg-[#F0F4F9] dark:bg-[#161B22] py-2 px-3 rounded-lg mt-2">
    <a v-if="Role !== UserRole.Admin" class="font-bold mb-1">Subscription details:</a>
    <a> Role:
      <NTag v-if="userInfo.roles.length > 0" size="small" :bordered="false" :type="Tag" @click="goSub">
        <a class="cursor-pointer font-semibold">{{ UserRole[userInfo.roles[0]] }}</a>
        <template v-if="Icon && props.icon" #icon>
          <SvgIcon :icon="Icon" />
        </template>
      </NTag>
    </a>
    <a> {{ userInfo.remark }} </a>
    <a v-if="Role === UserRole.Free" class="cursor-pointer text-[#fb923c]" @click="goSub">Buy subscription here</a>
    <a v-if="Role === UserRole.Admin" class="cursor-pointer text-[#14b8a6] font-semibold" @click="goSub">Administrator Account</a>
  </div>
  <NTag v-if="props.onlyTag && userInfo.roles.length > 0" size="small" :bordered="false" :type="Tag" @click="goSub">
    <a class="cursor-pointer font-semibold">{{ UserRole[userInfo.roles[0]] }}</a>
    <template v-if="Icon && props.icon" #icon>
      <SvgIcon :icon="Icon" />
    </template>
  </NTag>
</template>
