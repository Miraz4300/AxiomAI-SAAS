<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NInput, NSpin } from 'naive-ui'
import { UserPassword } from '@/components/admin/model'
import { fetchUpdateUserPassword } from '@/api'
import { t } from '@/locales'

const loading = ref(false)
const saving = ref(false)
const config = ref<UserPassword>()
async function updatePassword() {
  saving.value = true
  try {
    if (!config.value)
      throw new Error('Invalid')
    if (config.value.newPassword !== config.value.confirmPassword)
      throw new Error(t('setting.validatePasswordStartWith'))
    if (config.value.oldPassword === config.value.newPassword)
      throw new Error(t('setting.passwodSame'))
    await fetchUpdateUserPassword(config.value as UserPassword)
    window.$message?.success(t('common.success'))
  }
  catch (error: any) {
    window.$message?.error(error.message)
  }
  saving.value = false
}
onMounted(() => {
  config.value = new UserPassword()
})
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-5 min-h-[200px]">
      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.oldPassword') }}</span>
          <NInput
            type="password"
            :value="config && config.oldPassword"
            :placeholder="$t('setting.oldPassword')"
            @input="(val) => { if (config) config.oldPassword = val }"
          />
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.newPassword') }}</span>
          <NInput
            type="password"
            :value="config && config.newPassword"
            :placeholder="$t('setting.newPassword')"
            @input="(val) => { if (config) config.newPassword = val }"
          />
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.confirmNewPassword') }}</span>
          <NInput
            type="password"
            :value="config && config.confirmPassword"
            :disabled="!config || !config.newPassword"
            :placeholder="$t('setting.confirmNewPassword')"
            @input="(val) => { if (config) config.confirmPassword = val }"
          />
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]" />
          <div class="flex flex-wrap items-center gap-4">
            <NButton
              :loading="saving" type="primary" :disabled="!config || !config.newPassword || !config.confirmPassword || !config.oldPassword || config.confirmPassword !== config.newPassword || config.newPassword.length < 6"
              @click="updatePassword()"
            >
              {{ $t('common.save') }}
            </NButton>
          </div>
        </div>
      </div>
    </div>
  </NSpin>
</template>
