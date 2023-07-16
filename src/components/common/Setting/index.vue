<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { NLayout, NTabPane, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import General from './General.vue'
import Statistics from './Statistics.vue'
import About from './About.vue'
import Sidebar from '@/views/chat/components/Sidebar/index.vue'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const { isMobile } = useBasicLayout()

interface Props {
  visible: boolean
}
interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const route = useRoute()
const router = useRouter()
const active = ref('general')

onMounted(() => {
  const id = route.query.id
  active.value = id ? id as string : 'general'
  if (!id)
    router.replace({ query: { id: active.value } })
})
watch(active, (newTab) => {
  router.push({ query: { id: newTab } })
})

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
  <div class="flex h-full overflow-hidden" :class="[isMobile ? 'flex-col' : '']">
    <Sidebar v-if="!isMobile" />
    <NLayout v-model:show="show">
      <div class="min-h-full p-8">
        <header class="mb-4 text-2xl font-bold text-black dark:text-white">
          {{ $t('setting.setting') }}
        </header>
        <NLayoutContent>
          <NTabs v-model:value="active" type="line" animated>
            <NTabPane name="general">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:account-circle-outline" />
                <span class="ml-2">{{ $t('setting.general') }}</span>
              </template>
              <div class="mt-4 min-h-[100px] max-w-[460px]">
                <General />
              </div>
            </NTabPane>
            <NTabPane v-if="!isMobile" name="statistics">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:chart-box-outline" />
                <span class="ml-2">{{ $t('setting.statistics') }}</span>
              </template>
              <div class="mt-4 max-h-[780px] max-w-[1080px]">
                <Statistics />
              </div>
            </NTabPane>
            <NTabPane name="about">
              <template #tab>
                <SvgIcon class="text-lg" icon="mdi:about-circle-outline" />
                <span class="ml-2">{{ $t('setting.about') }}</span>
              </template>
              <div class="mt-4 min-h-[100px] max-w-[1080px]">
                <About />
              </div>
            </NTabPane>
          </NTabs>
        </NLayoutContent>
      </div>
    </NLayout>
    <Sidebar v-if="isMobile" />
  </div>
</template>
