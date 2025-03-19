<script setup lang='ts'>
import { computed, defineAsyncComponent } from 'vue'
import { NCard, NLayout, NLayoutContent, NTabPane, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import General from './General.vue'
import Password from './Password.vue'
import Security from './Security.vue'
import Subscription from './Subscription.vue'
import Statistics from './Statistics.vue'
import About from './About.vue'
import Sidebar from '@/views/chat/components/Sidebar/index.vue'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore } from '@/store'
import { useTheme } from '@/hooks/useTheme'

const { naiveCustom } = useTheme()
const appStore = useAppStore()
const merchEnabled = computed(() => appStore.merchEnabled)
const { isMobile } = useBasicLayout()

const route = useRoute()
const router = useRouter()
const active = computed({
  get: () => String(route.query.id ?? 'general'),
  set: value => router.push({ query: { ...route.query, id: value } }),
})

const Merch = defineAsyncComponent(() => import('./Merch.vue'))
</script>

<template>
  <div class="flex h-full overflow-hidden" :class="{ 'flex-col': isMobile }">
    <Sidebar v-if="!isMobile" />
    <NLayout>
      <div class="min-h-full" :class="[isMobile ? 'p-4' : 'p-8']">
        <p class="mb-4 text-2xl font-bold text-black dark:text-white">
          {{ $t('setting.setting') }}
        </p>
        <NLayoutContent>
          <NTabs v-model:value="active" type="line" animated>
            <NTabPane name="general">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:user-outline" />
                <span class="ml-2">{{ $t('setting.general') }}</span>
              </template>
              <div class="mt-4 min-h-[100px] max-w-[490px]">
                <General />
              </div>
            </NTabPane>
            <NTabPane name="password">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri:key-line" />
                <span class="ml-2">{{ $t('setting.passwordConfig') }}</span>
              </template>
              <div class="mt-2 min-h-[100px] max-w-[490px]">
                <Password />
              </div>
            </NTabPane>
            <NTabPane name="security">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:shield-account-outline" />
                <span class="ml-2">{{ $t('setting.MFAConfig') }}</span>
              </template>
              <Security />
            </NTabPane>
            <NTabPane name="subscription">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri:bank-card-line" />
                <span class="ml-2">{{ $t('setting.subscription') }}</span>
              </template>
              <div class="mt-4 px-4 min-h-[100px]">
                <Subscription />
              </div>
            </NTabPane>
            <NTabPane v-if="!isMobile" name="statistics">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:chart-box-outline" />
                <span class="ml-2">{{ $t('setting.statistics') }}</span>
              </template>
              <div class="mt-4 max-h-[780px] max-w-[1080px]">
                <NCard :theme-overrides="naiveCustom.Border">
                  <Statistics />
                </NCard>
              </div>
            </NTabPane>
            <NTabPane v-if="merchEnabled" name="merch">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri:shopping-bag-line" />
                <span class="ml-2">{{ $t('setting.merch') }}</span>
              </template>
              <div class="mt-4 min-h-[100px]">
                <Merch />
              </div>
            </NTabPane>
            <NTabPane name="about">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:about-circle-outline" />
                <span class="ml-2">{{ $t('setting.about') }}</span>
              </template>
              <div class="mt-4 min-h-[100px] max-w-[1080px]">
                <NCard :theme-overrides="naiveCustom.Border">
                  <About />
                </NCard>
              </div>
            </NTabPane>
          </NTabs>
        </NLayoutContent>
      </div>
    </NLayout>
    <Sidebar v-if="isMobile" />
  </div>
</template>
