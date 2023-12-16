<script setup lang="ts">
import { h, onMounted, reactive } from 'vue'
import { NCard, NDataTable, NStatistic, NTag } from 'naive-ui'
import { fetchGetDashboardData } from '@/api'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { UserRole } from '@/components/admin/model'
import { SvgIcon } from '@/components/common'

interface User {
  email: string
  createTime?: Date
  roles?: string[]
}

const dashboardData = reactive({
  normal: 0,
  disabled: 0,
  total: 0,
  subscribed: 0,
  premium: 0,
  newUsers: [] as User[],
  subscribedUsers: [] as User[],
})

onMounted(async () => {
  const response = await fetchGetDashboardData()
  const data = response.data
  dashboardData.normal = data.normal
  dashboardData.disabled = data.disabled
  dashboardData.total = data.total
  dashboardData.subscribed = data.subscribed
  dashboardData.premium = data.premium
  dashboardData.newUsers = data.newUsers
  dashboardData.subscribedUsers = data.subscribedUsers
})
</script>

<template>
  <div class="p-4 space-y-5 md:max-h-[740px] sm:min-h-[740px]">
    <NCard>
      <div class="flex justify-between">
        <NStatistic label="Active Users">
          <div class="flex items-center space-x-2">
            <SvgIcon class="text-[#22c55e]" icon="mdi:account-online-outline" />
            <p> {{ dashboardData.normal }} </p>
          </div>
        </NStatistic>
        <NStatistic label="Disabled Users">
          <div class="flex items-center space-x-2">
            <SvgIcon class="text-[#ef4444]" icon="mdi:user-off-outline" />
            <p> {{ dashboardData.disabled }} </p>
          </div>
        </NStatistic>
        <NStatistic label="Total Users">
          <div class="flex items-center space-x-2">
            <SvgIcon icon="mdi:account-group-outline" />
            <p> {{ dashboardData.total }} </p>
          </div>
        </NStatistic>
        <NStatistic label="Total Subscribed">
          <div class="flex items-center space-x-2">
            <SvgIcon icon="eos-icons:subscription-management" />
            <p> {{ dashboardData.subscribed }} </p>
          </div>
        </NStatistic>
        <NStatistic label="Premium Users">
          <div class="flex items-center space-x-2">
            <SvgIcon class="text-[#22c55e]" icon="ri:vip-diamond-fill" />
            <p> {{ dashboardData.premium }} </p>
          </div>
        </NStatistic>
      </div>
    </NCard>
    <div class="flex space-x-4">
      <NCard title="New users">
        <NDataTable
          :data="dashboardData.newUsers"
          :columns="[
            { title: 'Email', key: 'email' },
            { title: 'Verification Time', key: 'createTime' },
          ]"
        />
      </NCard>
      <NCard title="Paid users">
        <NDataTable
          :data="dashboardData.subscribedUsers"
          :columns="[
            { title: 'Email', key: 'email' },
            {
              title: 'Roles',
              key: 'roles',
              render(row: any) {
                const roles = row.roles.map((role: UserRole) => {
                  const tagType = (() => {
                    if (role === UserRole.Premium)
                      return 'success'
                    if (role === UserRole.MVP)
                      return 'warning'
                    if (role === UserRole.Support)
                      return 'success'
                    if (role === UserRole.Enterprise)
                      return 'error'
                    if (role === UserRole.Basic || role === UserRole['Basic+'])
                      return 'info'
                    return 'default'
                  })()
                  return h(
                    NTag,
                    {
                      type: tagType,
                      bordered: false,
                    },
                    {
                      default: () => UserRole[role],
                    },
                  )
                })
                return roles
              },
            },
          ]"
        />
      </NCard>
    </div>
    <NCard title="Activity log">
      <p> Coming soon... </p>
    </NCard>
  </div>
</template>
