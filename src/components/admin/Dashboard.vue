<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { NCard, NDataTable, NNumberAnimation, NSpin, NStatistic, NTag } from 'naive-ui'
import { fetchGetDashboardData } from '@/api'
import { UserRole } from '@/components/admin/model'
import { SvgIcon } from '@/components/common'

const dashboardData = ref<DashboardData | null>(null)
const loading = ref<boolean>(false)

interface User {
  email: string
  createTime?: Date
  roles?: UserRole[]
}

interface DashboardData {
  normal: number
  disabled: number
  total: number
  subscribed: number
  premium: number
  newUsers: User[]
  subscribedUsers: User[]
}

const roleToTagType = new Map([
  [UserRole.Premium, 'success'],
  [UserRole.MVP, 'warning'],
  [UserRole.Support, 'success'],
  [UserRole.Enterprise, 'error'],
  [UserRole.Basic, 'info'],
  [UserRole['Basic+'], 'info'],
])

function renderRoles(row: User) {
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
          <NStatistic label="Active Users">
            <div class="flex items-center gap-2">
              <SvgIcon class="text-[#22c55e]" icon="mdi:account-online-outline" />
              <NNumberAnimation :to="dashboardData?.normal" />
            </div>
          </NStatistic>
          <NStatistic label="Disabled Users">
            <div class="flex items-center gap-2">
              <SvgIcon class="text-[#ef4444]" icon="mdi:user-off-outline" />
              <NNumberAnimation :to="dashboardData?.disabled" />
            </div>
          </NStatistic>
          <NStatistic label="Total Users">
            <div class="flex items-center gap-2">
              <SvgIcon icon="mdi:account-group-outline" />
              <NNumberAnimation :to="dashboardData?.total" />
            </div>
          </NStatistic>
          <NStatistic label="Total Subscribed">
            <div class="flex items-center gap-2">
              <SvgIcon icon="eos-icons:subscription-management" />
              <NNumberAnimation :to="dashboardData?.subscribed" />
            </div>
          </NStatistic>
          <NStatistic label="Premium Users">
            <div class="flex items-center gap-2">
              <SvgIcon class="text-[#22c55e]" icon="ri:vip-diamond-fill" />
              <NNumberAnimation :to="dashboardData?.premium" />
            </div>
          </NStatistic>
        </div>
      </NCard>
      <div class="h-[33rem] flex space-x-4">
        <NCard title="New users">
          <NDataTable
            :data="dashboardData?.newUsers"
            :columns="[
              { title: 'Email', key: 'email' },
              { title: 'Verification Time', key: 'createTime' },
            ]"
          />
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
              <div class="bg-brand-logo bg-contain w-[25px] h-[25px]" draggable="false" />
              <a class="font-semibold">Revenue:</a>
              <NNumberAnimation show-separator :to="22310" />
              BDT (Till 30-11-2023)
            </div>
          </template>
        </NCard>
      </div>
    </div>
  </NSpin>
</template>
