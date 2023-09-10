<script lang="ts" setup>
import { computed, ref } from 'vue'
import { NAlert, NButton, NCard, NModal, NTag } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { UserRole } from '@/components/admin/model'
import { useUserStore } from '@/store'

const show = ref(false)

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const Role = userInfo.value.roles[0]
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
            <span>
              Unlocks:
              <br>
              1. GPT-4 and other models
              <br>
              2. Higher avalibility of GPT-3.5 and GPT-4
              <br>
              3. Stable Diffusion Model (coming soon)
              <br>
              4. Mid-journey - 10/day (coming soon)
            </span>
            <NButton v-if="Role === UserRole.Premium" strong secondary type="primary">
              Your benefits are activated
            </NButton>
            <NButton v-else strong secondary type="primary" @click="show = true">
              Buy Now - BDT 150/=
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
            <span>
              Unlocks:
              <br>
              1. GPT-4 and other models
              <br>
              2. Higher avalibility of GPT-3.5 and GPT-4
              <br>
              3. Stable Diffusion Model (coming soon)
              <br>
              4. Mid-journey - 30/day (coming soon)
            </span>
            <NButton v-if="Role === UserRole.MVP" strong secondary type="primary">
              Your benefits are activated
            </NButton>
            <NButton v-else strong secondary type="primary" @click="show = true">
              Buy Now - BDT 250/=
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
            <span>
              Benefits for 3 months:
              <br>
              Help us to keep the project alive and additionally you will get:
              <br>
              1. Everything includes in MVP
              <br>
              2. Exclusive T-shirt
            </span>
            <NButton v-if="Role === UserRole.Support" strong secondary type="primary">
              We truly appreciate your support! ❤️
            </NButton>
            <NButton v-else strong secondary type="primary" @click="show = true">
              Buy Now - BDT 1000/=
            </NButton>
          </div>
        </NCard>
      </div>
      <NAlert type="info">
        We are currently accepting <SvgIcon class="inline-block" icon="arcticons:bkash" /> bKash and <SvgIcon class="inline-block" icon="arcticons:nagad" /> Nagad payment.
      </NAlert>
    </div>
  </NCard>

  <NModal v-model:show="show" style="max-width: 370px">
    <NCard :bordered="false" role="dialog" title="Buy subscription">
      <a href="https://forms.office.com/r/2Z1fz0NhgE" target="_blank">
        <img src="https://blob.axiomaibd.com/files/QRCode-for-AxiomAI-Subscription.png">
      </a>
    </NCard>
  </NModal>
</template>
