<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NAlert, NButton, NCard, NModal, NTag } from 'naive-ui'
import type { SubscriptionConfig } from '@/components/admin/model'
import { UserRole } from '@/components/admin/model'
import { SvgIcon } from '@/components/common'
import { fetchUserSubscription } from '@/api'
import { useUserStore } from '@/store'

const show = ref(false)

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const Role = userInfo.value.roles[0]
const subscriptionConfig = ref<SubscriptionConfig>()

onMounted(async () => {
  const response = await fetchUserSubscription<SubscriptionConfig>()
  subscriptionConfig.value = response.data
})
</script>

<template>
  <NCard title="Subscription">
    <div class="space-y-4">
      <p class="text-gray-500 dark:text-gray-400">
        Purchase your subscription here to activate it for a duration of 30 days.<br>
        After purschasing, subscription will be activated within 3 hours.
      </p>
      <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
        <NCard title="Premium" hoverable>
          <template v-if="Role === UserRole.Premium" #header-extra>
            <NTag round :bordered="false" type="success">
              Active
              <template #icon>
                <SvgIcon icon="ri:checkbox-circle-line" />
              </template>
            </NTag>
          </template>
          <div class="flex flex-col space-y-4">
            <span v-html="subscriptionConfig?.premium && subscriptionConfig.premium.details" />
            <NButton v-if="Role === UserRole.Premium" strong secondary type="primary">
              {{ subscriptionConfig?.premium && subscriptionConfig.premium.message }}
            </NButton>
            <NButton v-else strong secondary type="primary" @click="show = true">
              {{ subscriptionConfig?.premium && subscriptionConfig.premium.price }}
            </NButton>
          </div>
        </NCard>
        <NCard title="MVP" hoverable>
          <template v-if="Role === UserRole.MVP" #header-extra>
            <NTag round :bordered="false" type="success">
              Active
              <template #icon>
                <SvgIcon icon="ri:checkbox-circle-line" />
              </template>
            </NTag>
          </template>
          <div class="flex flex-col space-y-4">
            <span v-html="subscriptionConfig?.mvp && subscriptionConfig.mvp.details" />
            <NButton v-if="Role === UserRole.MVP" strong secondary type="primary">
              {{ subscriptionConfig?.mvp && subscriptionConfig.mvp.message }}
            </NButton>
            <NButton v-else strong secondary type="primary" @click="show = true">
              {{ subscriptionConfig?.mvp && subscriptionConfig.mvp.price }}
            </NButton>
          </div>
        </NCard>
        <NCard title="Supporter" hoverable>
          <template v-if="Role === UserRole.Support" #header-extra>
            <NTag round :bordered="false" type="success">
              Active
              <template #icon>
                <SvgIcon icon="ri:checkbox-circle-line" />
              </template>
            </NTag>
          </template>
          <div class="flex flex-col space-y-4">
            <span v-html="subscriptionConfig?.support && subscriptionConfig.support.details" />
            <NButton v-if="Role === UserRole.Support" strong secondary type="primary">
              {{ subscriptionConfig?.support && subscriptionConfig.support.message }}
            </NButton>
            <NButton v-else strong secondary type="primary" @click="show = true">
              {{ subscriptionConfig?.support && subscriptionConfig.support.price }}
            </NButton>
          </div>
        </NCard>
      </div>
      <NAlert type="info">
        We currently accept <SvgIcon class="inline-block" icon="arcticons:bkash" /> bKash and <SvgIcon class="inline-block" icon="arcticons:nagad" /> Nagad payment.
      </NAlert>
    </div>
  </NCard>

  <NModal v-model:show="show" style="max-width: 370px">
    <NCard :bordered="false" role="dialog" title="Buy subscription">
      <a :href="subscriptionConfig?.subURL" target="_blank">
        <img :src="subscriptionConfig?.subImageLink">
      </a>
    </NCard>
  </NModal>
</template>
