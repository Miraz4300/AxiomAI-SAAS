<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { NCard, NDataTable, NStatistic, NTag } from 'naive-ui'
import { fetchGetDashboardData } from '@/api'
import { UserRole } from '@/components/admin/model'
import { SvgIcon } from '@/components/common'

const dashboardData = ref<DashboardData | null>(null)

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
      },
      {
        default: () => UserRole[role],
      },
    )
  })
}

onMounted(async () => {
  dashboardData.value = (await fetchGetDashboardData()).data
})
</script>

<template>
  <div class="p-4 space-y-5 md:max-h-[740px] sm:min-h-[740px]">
    <NCard>
      <div class="flex justify-between">
        <NStatistic label="Active Users">
          <div class="flex items-center space-x-2">
            <SvgIcon class="text-[#22c55e]" icon="mdi:account-online-outline" />
            <p> {{ dashboardData?.normal }} </p>
          </div>
        </NStatistic>
        <NStatistic label="Disabled Users">
          <div class="flex items-center space-x-2">
            <SvgIcon class="text-[#ef4444]" icon="mdi:user-off-outline" />
            <p> {{ dashboardData?.disabled }} </p>
          </div>
        </NStatistic>
        <NStatistic label="Total Users">
          <div class="flex items-center space-x-2">
            <SvgIcon icon="mdi:account-group-outline" />
            <p> {{ dashboardData?.total }} </p>
          </div>
        </NStatistic>
        <NStatistic label="Total Subscribed">
          <div class="flex items-center space-x-2">
            <SvgIcon icon="eos-icons:subscription-management" />
            <p> {{ dashboardData?.subscribed }} </p>
          </div>
        </NStatistic>
        <NStatistic label="Premium Users">
          <div class="flex items-center space-x-2">
            <SvgIcon class="text-[#22c55e]" icon="ri:vip-diamond-fill" />
            <p> {{ dashboardData?.premium }} </p>
          </div>
        </NStatistic>
      </div>
    </NCard>
    <div class="flex space-x-4">
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
        />
      </NCard>
    </div>
    <NCard title="Activity log">
      <p> Coming soon... </p>
    </NCard>
  </div>
</template>
