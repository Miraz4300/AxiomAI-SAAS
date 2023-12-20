<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { NCard, NDataTable, NNumberAnimation, NSpin, NStatistic, NTag, NTimeline, NTimelineItem } from 'naive-ui'
import { fetchGetDashboardData } from '@/api'
import type { UserInfo } from '@/components/admin/model'
import { Status, UserRole } from '@/components/admin/model'
import { SvgIcon } from '@/components/common'

const dashboardData = ref<DashboardData | null>(null)
const loading = ref<boolean>(false)

interface DashboardData {
  normal: number
  disabled: number
  total: number
  subscribed: number
  premium: number
  newUsers: UserInfo[]
  subscribedUsers: UserInfo[]
}

const roleToTagType = new Map([
  [UserRole.Premium, 'success'],
  [UserRole.MVP, 'warning'],
  [UserRole.Support, 'success'],
  [UserRole.Enterprise, 'error'],
  [UserRole.Basic, 'info'],
  [UserRole['Basic+'], 'info'],
])

function renderRoles(row: UserInfo) {
  return row.roles?.map((role) => {
    const tagType = roleToTagType.get(role) || 'default'
    return h(
      NTag,
      {
        type: tagType as any,
        bordered: false,
        size: 'small',
      },
      {
        default: () => UserRole[role],
      },
    )
  })
}

function getType(status: Status | undefined) {
  return status === Status.Normal
    ? 'success'
    : status === Status.Unverified
      ? 'warning'
      : status === Status.Disabled
        ? 'error'
        : status === Status.AdminVerify
          ? 'info'
          : 'default'
}

const showStatus = (status: Status | undefined) => status !== undefined ? Status[status] : 'N/A'
const formatTime = (time: string | undefined) => time ? new Date(time).toLocaleString() : 'N/A'

const statistics = computed(() => [
  { label: 'Active Users', icon: 'mdi:account-online-outline', color: 'text-[#22c55e]', value: dashboardData.value?.normal },
  { label: 'Disabled Users', icon: 'mdi:user-off-outline', color: 'text-[#ef4444]', value: dashboardData.value?.disabled },
  { label: 'Total Users', icon: 'mdi:account-group-outline', value: dashboardData.value?.total },
  { label: 'Total Subscribed', icon: 'eos-icons:subscription-management', value: dashboardData.value?.subscribed },
  { label: 'Premium Users', icon: 'ri:vip-diamond-fill', color: 'text-[#22c55e]', value: dashboardData.value?.premium },
])

onMounted(async () => {
  loading.value = true
  dashboardData.value = (await fetchGetDashboardData()).data
  loading.value = false
})
</script>

<template>
  <NSpin :show="loading" size="small">
    <template #description>
      Fetching data...
    </template>
    <div class="p-4 space-y-5 md:max-h-[740px] sm:min-h-[740px]">
      <NCard class="pr-2 pl-2" title="Statistics">
        <div class="flex justify-between">
          <NStatistic v-for="(stat, index) in statistics" :key="index" :label="stat.label">
            <div class="flex items-center gap-2">
              <SvgIcon :class="stat.color" :icon="stat.icon" />
              <NNumberAnimation :to="stat.value" />
            </div>
          </NStatistic>
        </div>
      </NCard>
      <div class="h-[33rem] flex space-x-4">
        <NCard title="New users">
          <NTimeline>
            <NTimelineItem
              v-for="(user, index) in dashboardData?.newUsers"
              :key="index"
              :type="getType(user.status)"
              :title="showStatus(user.status)"
              :content="user.email"
              :time="formatTime(user.createTime)"
            />
          </NTimeline>
        </NCard>
        <NCard title="Paid users">
          <NDataTable
            :data="dashboardData?.subscribedUsers"
            :columns="[
              { title: 'Email', key: 'email' },
              { title: 'Roles', key: 'roles', render: renderRoles },
            ]"
            :max-height="300"
          />
          <template #action>
            <div class="flex gap-2 items-center">
              <a class="bg-brand-logo bg-contain w-[24px] h-[24px]" draggable="false" />
              <span class="text-gray-600">|</span>
              <p>
                <a class="font-semibold">Revenue: </a>
                <NNumberAnimation show-separator :to="22310" />
                BDT (Till 30-11-2023)
              </p>
              <span class="text-gray-600">|</span>
              <p>
                <a class="font-semibold">Net Profit: </a>
                <NNumberAnimation show-separator :to="18520" />
                BDT (Till 30-11-2023)
              </p>
            </div>
          </template>
        </NCard>
      </div>
    </div>
  </NSpin>
</template>
