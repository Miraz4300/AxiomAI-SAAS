<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NLayout, NTabPane, NTabs } from 'naive-ui'
import General from './General.vue'
import Statistics from './Statistics.vue'
import About from './About.vue'
import Menu from '@/views/chat/components/Menu/index.vue'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const { isMobile } = useBasicLayout()

const getMobileClass = computed(() => (isMobile.value ? ['rounded-none', 'shadow-none'] : ['border', 'rounded-none', 'shadow-md', 'dark:border-neutral-800']))
const getMobileMenu = computed(() => (isMobile.value ? ['flex', 'flex-col', 'h-full'] : ['']))

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
  <div class="flex h-full overflow-hidden" :class="[getMobileClass, getMobileMenu]">
    <Menu v-if="!isMobile" />
    <NLayout v-model:show="show">
      <div class="min-h-full p-8">
        <header class="mb-4 text-2xl font-bold text-black dark:text-white">
          Personal Settings
        </header>
        <NLayoutContent>
          <NTabs v-model:value="active" type="line" animated>
            <NTabPane name="General" tab="General">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:account-circle-outline" />
                <span class="ml-2">{{ $t('setting.general') }}</span>
              </template>
              <div class="min-h-[100px] max-w-[460px]">
                <General />
              </div>
            </NTabPane>
            <NTabPane v-if="!isMobile" name="Statistics" tab="Statistics">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:chart-box-outline" />
                <span class="ml-2">{{ $t('setting.statistics') }}</span>
              </template>
              <div class="min-h-[100px] max-w-[1080px]">
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
        </NLayoutContent>
      </div>
    </NLayout>
    <Menu v-if="isMobile" />
  </div>
</template>
