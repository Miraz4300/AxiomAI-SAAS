<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NCard, NModal, NTabPane, NTabs } from 'naive-ui'
import General from './General.vue'
import Advanced from './Advanced.vue'
import Statistics from './Statistics.vue'
import About from './About.vue'
import { SvgIcon } from '@/components/common'
import { useAuthStore } from '@/store'

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const authStore = useAuthStore()

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const active = ref('General')

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})
</script>

<template>
  <NModal v-model:show="show" :auto-focus="false">
    <NCard role="dialog" aria-modal="true" :bordered="false" style="width: 95%; max-width: 640px">
      <NTabs v-model:value="active" type="line" animated>
        <NTabPane name="General" tab="General">
          <template #tab>
            <SvgIcon class="text-lg" icon="mdi:account-circle-outline" />
            <span class="ml-2">{{ $t('setting.general') }}</span>
          </template>
          <div class="min-h-[100px]">
            <General />
          </div>
        </NTabPane>
        <NTabPane v-if="isChatGPTAPI" name="Advanced" tab="Advanced">
          <template #tab>
            <SvgIcon class="text-lg" icon="mdi:tune" />
            <span class="ml-2">{{ $t('setting.advanced') }}</span>
          </template>
          <div class="min-h-[100px]">
            <Advanced />
          </div>
        </NTabPane>
        <NTabPane name="Statistics" tab="Statistics">
          <template #tab>
            <SvgIcon class="text-lg" icon="mdi:chart-box-outline" />
            <span class="ml-2">{{ $t('setting.statistics') }}</span>
          </template>
          <div class="min-h-[100px]">
            <Statistics />
          </div>
        </NTabPane>
        <NTabPane name="About" tab="About">
          <template #tab>
            <SvgIcon class="text-lg" icon="mdi:about-circle-outline" />
            <span class="ml-2">{{ $t('setting.about') }}</span>
          </template>
          <About />
        </NTabPane>
      </NTabs>
    </NCard>
  </NModal>
</template>
