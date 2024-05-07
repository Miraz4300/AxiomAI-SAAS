<script setup lang="ts">
import { computed } from 'vue'
import { NAlert, NButton, NCard, NTag } from 'naive-ui'
import { UserRole } from '@/components/admin/model'
import { SvgIcon } from '@/components/common'
import { useSubStore, useUserStore } from '@/store'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const Role = userInfo.value.roles[0]

const subStore = useSubStore() as any
subStore.UserSubscription()

const roleMap: { [key: string]: UserRole } = {
  premium: UserRole.Premium,
  mvp: UserRole.MVP,
  support: UserRole.Support,
  basic: UserRole.Basic,
  basicPlus: UserRole['Basic+'],
  enterprise: UserRole.Enterprise,
}

const subscriptions = ['premium', 'mvp', 'support', 'basic', 'basicPlus', 'enterprise'].map(type => ({
  type,
  enabled: computed(() => subStore[`${type}Enabled`]),
  title: computed(() => subStore[`${type}Title`]),
  price: computed(() => subStore[`${type}Price`]),
  details: computed(() => subStore[`${type}Details`]),
  message: computed(() => subStore[`${type}Message`]),
  role: roleMap[type],
}))

const enabledSubscriptions = computed(() => subscriptions.filter(sub => sub.enabled.value))
const subURL = computed(() => subStore.subURL)

function handleButtonClick(type: string) {
  if (type === 'enterprise')
    window.location.href = 'mailto:sales@axiomaibd.com'
  else
    window.open(subURL.value, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="space-y-2 mb-8">
    <p class="text-xl font-semibold text-neutral-600 dark:text-neutral-200">
      Subscription
    </p>
    <p class="text-neutral-600 dark:text-neutral-300">
      Purchase your subscription here to activate it for a duration of 30 days.<br>
      After purschasing, subscription will be activated within an hour.
    </p>
  </div>
  <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3 mb-4">
    <NCard v-for="(subscription, index) in enabledSubscriptions" :key="index" :title="subscription.title.value" hoverable>
      <template v-if="Role === subscription.role" #header-extra>
        <NTag round :bordered="false" type="success">
          Active
          <template #icon>
            <SvgIcon icon="ri:checkbox-circle-line" />
          </template>
        </NTag>
      </template>
      <div class="flex flex-col space-y-4">
        <span v-html="subscription.details.value" />
        <NButton v-if="Role === subscription.role" strong secondary type="primary">
          {{ subscription.message.value }}
        </NButton>
        <NButton v-else strong secondary type="primary" @click="handleButtonClick(subscription.type)">
          {{ subscription.price.value }}
        </NButton>
      </div>
    </NCard>
  </div>
  <NAlert type="info">
    We currently accept <SvgIcon class="inline-block" icon="arcticons:bkash" /> bKash and <SvgIcon class="inline-block" icon="arcticons:nagad" /> Nagad payment.
  </NAlert>
</template>
