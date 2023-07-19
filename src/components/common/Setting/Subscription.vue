<script lang="ts" setup>
import { NButton, NCard, NModal } from 'naive-ui'
import { ref } from 'vue'

const show = ref(false)
</script>

<template>
  <NCard title="Subscription">
    <div class="space-y-4">
      <p class="text-gray-500 dark:text-gray-400">
        You can buy subscription from here. We are currently accepting bKash and Nagad.
        After purschasing subscription will be activated within 3 hours.
      </p>
      <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
        <NCard title="Premium" hoverable>
          <div class="flex flex-col space-y-4">
            <span>
              Unlocks:
              <br>
              1. Higher avalibility of GPT-3.5 and GPT-4
              <br>
              2. Ability to use GPT-3.5 with 16k tokens
              <br>
              3. Mid-journey (coming soon)
            </span>
            <NButton strong secondary type="primary" @click="show = true">
              Buy Now - BDT 150/=
            </NButton>
          </div>
        </NCard>
        <NCard title="MVP" hoverable>
          <div class="flex flex-col space-y-4">
            <span>
              Unlocks:
              <br>
              1. Higher avalibility of GPT-3.5 and GPT-4
              <br>
              2. Ability to use GPT-3.5 with 16k tokens
              <br>
              3. Mid-journey - unlimited (coming soon)
            </span>
            <NButton strong secondary type="primary" @click="show = true">
              Buy Now - BDT 250/=
            </NButton>
          </div>
        </NCard>
        <NCard title="Supporter" hoverable>
          <div class="flex flex-col space-y-4">
            <span>
              Help us to keep the project alive and additionally you will get:
              <br>
              1. Everything includes in Premium
              <br>
              2. Exclusive T-shirt
            </span>
            <NButton strong secondary type="primary" @click="show = true">
              Buy Now - BDT 500/=
            </NButton>
          </div>
        </NCard>
      </div>
    </div>
  </NCard>

  <NModal v-model:show="show" style="max-width: 370px">
    <NCard :bordered="false" role="dialog" title="Buy subscription">
      <a href="https://forms.office.com/r/2Z1fz0NhgE" target="_blank">
        <img src="https://axiomai.s3.us-west-002.backblazeb2.com/QRCode-for-AxiomAI-Subscription.png">
      </a>
    </NCard>
  </NModal>
</template>
