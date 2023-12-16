<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { NCard, NStatistic } from 'naive-ui'
import { fetchGetDashboardData } from '@/api'
import { SvgIcon } from '@/components/common'

const dashboardData = reactive({
  normal: 0,
  disabled: 0,
  total: 0,
  subscribed: 0,
  premium: 0,
})

onMounted(async () => {
  const response = await fetchGetDashboardData()
  const data = response.data
  dashboardData.normal = data.normal
  dashboardData.disabled = data.disabled
  dashboardData.total = data.total
  dashboardData.subscribed = data.subscribed
  dashboardData.premium = data.premium
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
      <NCard title="Recent Activities">
        <p>Recent Activities of Users</p>
      </NCard>
      <NCard title="Recent Activities">
        <p>Recent Activities of Subscription</p>
      </NCard>
    </div>
  </div>
</template>
