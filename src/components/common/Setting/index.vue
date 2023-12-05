<script setup lang='ts'>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { NCard, NLayout, NTabPane, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import General from './General.vue'
import Password from './Password.vue'
import TwoFA from './TwoFA.vue'
import Subscription from './Subscription.vue'
import Statistics from './Statistics.vue'
import About from './About.vue'
import Speech from './Speech.vue'
import Merch from './Merch.vue'
import Sidebar from '@/views/chat/components/Sidebar/index.vue'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useSpeechStore } from '@/store/modules/speech'
import { useAppStore } from '@/store'

const appStore = useAppStore()
const merchEnabled = computed(() => appStore.merchEnabled)
const { isMobile } = useBasicLayout()
const speechStore = useSpeechStore()

const route = useRoute()
const router = useRouter()
const active = ref('general')

onMounted(() => {
  const id = route.query.id
  active.value = id ? id as string : 'general'
  if (!id)
    router.replace({ query: { id: active.value } })
})
watchEffect(() => {
  const id = route.query.id
  if (id)
    active.value = id as string
})
watch(active, (newTab) => {
  router.push({ query: { id: newTab } })
})
</script>

<template>
  <div class="flex h-full overflow-hidden" :class="[isMobile ? 'flex-col' : '']">
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
            <NTabPane name="2FA">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:shield-account-outline" />
                <span class="ml-2">{{ $t('setting.twoFAConfig') }}</span>
              </template>
              <TwoFA />
            </NTabPane>
            <NTabPane v-if="!isMobile && speechStore.enable" name="speech">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri:voice-recognition-line" />
                <span class="ml-2">{{ $t('setting.speech') }}</span>
              </template>
              <div class="mt-4 min-h-[100px] max-w-[720px]">
                <NCard>
                  <Speech />
                </NCard>
              </div>
            </NTabPane>
            <NTabPane name="subscription">
              <template #tab>
                <SvgIcon class="text-lg" icon="ri:bank-card-line" />
                <span class="ml-2">{{ $t('setting.subscription') }}</span>
              </template>
              <div class="mt-4 min-h-[100px]">
                <Subscription />
              </div>
            </NTabPane>
            <NTabPane v-if="!isMobile" name="statistics">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:chart-box-outline" />
                <span class="ml-2">{{ $t('setting.statistics') }}</span>
              </template>
              <div class="mt-4 max-h-[780px] max-w-[1080px]">
                <NCard>
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
                <NCard>
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
