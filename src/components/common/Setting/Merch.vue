<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore } from '@/store'
import Product from '@/components/common/ProductCard/Card.vue'
import type { MerchConfig } from '@/components/admin/model'
import { fetchUserMerch } from '@/api'

const appStore = useAppStore()
const theme = computed(() => appStore.theme)
const { isMobile } = useBasicLayout()

const lightBanner = ref('')
const darkBanner = ref('')
const merchConfig = ref<MerchConfig>()

onMounted(async () => {
  const response = await fetchUserMerch<MerchConfig>()
  merchConfig.value = response.data
  lightBanner.value = merchConfig.value?.lightBanner || ''
  darkBanner.value = merchConfig.value?.darkBanner || ''
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-center">
      <div class="w-auto">
        <img v-if="theme === 'light'" :src="lightBanner">
        <img v-else :src="darkBanner">
      </div>
    </div>
    <div class="pl-4 pr-4 flex justify-center" :class="[isMobile ? 'flex-col space-y-4' : 'space-x-4']">
      <Product
        v-for="(product, index) in (merchConfig && merchConfig.products || [])"
        :key="index"
        :product-img="product.img"
        :product-name="product.name"
        :product-price="product.price"
        :product-stock="product.stock"
      />
    </div>
  </div>
</template>
