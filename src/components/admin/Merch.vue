<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NButton, NCard, NInput, NInputNumber, NSpin, NSwitch, useMessage } from 'naive-ui'
import type { ConfigState, MerchConfig } from './model'
import { fetchChatConfig, fetchUpdateMerch } from '@/api'

const ms = useMessage()

const loading = ref(false)
const saving = ref(false)

const config = ref<MerchConfig>()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data.merchConfig
  }
  finally {
    loading.value = false
  }
}

async function updateMerch() {
  saving.value = true
  try {
    const { data } = await fetchUpdateMerch(config.value as MerchConfig)
    config.value = data
    ms.success('Saved Successfully')
  }
  catch (error: any) {
    ms.error(error.message)
  }
  saving.value = false
}

function addProduct() {
  if (!config.value)
    config.value = { products: [] }

  config.value.products.push({
    img: '',
    name: '',
    price: 0,
    stock: false,
    code: '',
  })
}

onMounted(() => {
  fetchConfig().then(() => {
    if (!config.value)
      addProduct() // Add an empty product if there's no initial data
  })
})
</script>

<template>
  <div class="flex flex-col space-x-4">
    <NSpin :show="loading">
      <NCard title="Banner">
        <div class="p-4 space-y-5 min-h-[200px]">
          <div class="space-y-6">
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0 w-[100px]">Light Banner</span>
              <div class="flex-1">
                <NInput
                  :value="config && config.lightBanner" placeholder="banner for light theme" style="max-width: 30%"
                  @input="(val: string | undefined) => { if (config && val !== undefined) config.lightBanner = val }"
                />
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0 w-[100px]">Dark Banner</span>
              <div class="flex-1">
                <NInput
                  :value="config && config.darkBanner" placeholder="banner for dark theme" style="max-width: 30%"
                  @input="(val: string | undefined) => { if (config && val !== undefined) config.darkBanner = val }"
                />
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0 w-[100px]" />
              <div class="flex flex-wrap items-center gap-4">
                <NButton :loading="saving" type="primary" @click="updateMerch()">
                  {{ $t('common.save') }}
                </NButton>
              </div>
            </div>
          </div>
        </div>
      </NCard>
      <NCard v-for="(product, i) in (config && config.products || [])" :key="i" :title="`Product: ${i}`">
        <div class="p-4 space-y-5 min-h-[200px]">
          <div class="space-y-6">
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0 w-[100px]">Product Name</span>
              <div class="flex-1">
                <NInput
                  :value="product.name" placeholder="product name" style="max-width: 30%"
                  @input="(val: string | undefined) => { product.name = val || '' }"
                />
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0 w-[100px]">Product Code</span>
              <div class="flex-1">
                <NInput
                  :value="product.code" placeholder="product code" style="max-width: 30%"
                  @input="(val: string | undefined) => { product.code = val || '' }"
                />
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0 w-[100px]">Product Image</span>
              <div class="flex-1">
                <NInput
                  :value="product.img" placeholder="product image url" style="max-width: 30%"
                  @input="(val: string | undefined) => { product.img = val || '' }"
                />
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0 w-[100px]">Product Price</span>
              <div class="flex-1">
                <NInputNumber
                  :value="product.price" placeholder="product price in taka" style="max-width: 30%"
                  @update:value="(val: number | null) => { if (val !== null) product.price = val }"
                />
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0 w-[100px]">Product Stock</span>
              <div class="flex-1">
                <NSwitch
                  :round="false" :value="product.stock"
                  @update:value="(val: boolean | undefined) => { if (val !== undefined) product.stock = val }"
                />
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0 w-[100px]" />
              <div class="flex flex-wrap items-center gap-4">
                <NButton :loading="saving" type="primary" @click="updateMerch()">
                  {{ $t('common.save') }}
                </NButton>
                <NButton type="primary" @click="addProduct()">
                  Add Product
                </NButton>
              </div>
            </div>
          </div>
        </div>
      </NCard>
    </NSpin>
  </div>
</template>
