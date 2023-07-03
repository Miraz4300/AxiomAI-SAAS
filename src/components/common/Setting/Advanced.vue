<script lang="ts" setup>
import { ref } from 'vue'
import { NRadioButton, NRadioGroup, NSlider, useMessage } from 'naive-ui'
import { useSettingStore } from '@/store'
import type { SettingsState } from '@/store/modules/settings/helper'
import { t } from '@/locales'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const settingStore = useSettingStore()
const ms = useMessage()

const { isMobile } = useBasicLayout()
const isMobileValue = isMobile.value
const spacing = isMobileValue ? 'space-x-1' : 'space-x-10'
const width = isMobileValue ? 'w-[280px]' : 'w-[300px]'
const mt = isMobileValue ? 'mt-3' : ''

const memory = ref(settingStore.memory ?? 1)
const marks = {
  1: t('setting.memory1'),
  50: t('setting.memory2'),
  99: t('setting.memory3'),
}
const persona = ref(settingStore.persona ?? 'balanced')
const precise = 'precise'
const balanced = 'balanced'
const creative = 'creative'

function updateSettings(options: Partial<SettingsState>) {
  settingStore.updateSetting(options)
  ms.success(t('common.success'))
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex flex-wrap items-center" :class="[spacing]">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.memory') }}</span>
        <div :class="[width]">
          <NSlider v-model:value="memory" :marks="marks" step="mark" :tooltip="false" @update:value="updateSettings({ memory })" />
        </div>
      </div>
      <div class="flex flex-wrap items-center" :class="[spacing]">
        <span class="flex-shrink-0 w-[100px]" />
        <div class="w-[300px] text-center text-neutral-500 dark:text-gray-400">
          {{ $t('setting.memory_info') }}
        </div>
      </div>
      <div class="flex flex-wrap items-center" :class="[spacing]">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.persona') }}</span>
        <div :class="[width, mt]">
          <NRadioGroup v-model:value="persona" size="medium" @update:value="updateSettings({ persona })">
            <NRadioButton :value="precise">
              {{ $t('setting.persona1') }}
            </NRadioButton>
            <NRadioButton :value="balanced">
              {{ $t('setting.persona2') }}
            </NRadioButton>
            <NRadioButton :value="creative">
              {{ $t('setting.persona3') }}
            </NRadioButton>
          </NRadioGroup>
        </div>
      </div>
      <div class="flex flex-wrap items-center" :class="[spacing]">
        <span class="flex-shrink-0 w-[100px]" />
        <div class="w-[300px] text-center text-neutral-500 dark:text-gray-400">
          <span v-if="precise === persona">
            {{ $t('setting.persona1_info') }}
          </span>
          <span v-else-if="balanced === persona">
            {{ $t('setting.persona2_info') }}
          </span>
          <span v-else>
            {{ $t('setting.persona3_info') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
