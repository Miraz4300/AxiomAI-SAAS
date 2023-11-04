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
const merchConfig = ref<MerchConfig>()

onMounted(async () => {
  const response = await fetchUserMerch<MerchConfig>()
  merchConfig.value = response.data
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-center">
      <div class="w-auto">
        <img v-if="theme === 'light'" :src="merchConfig?.lightBanner">
        <img v-else :src="merchConfig?.darkBanner">
      </div>
    </div>
    <div class="pt-4 grid gap-6" :class="[isMobile ? 'grid-cols-1' : 'pl-8 pr-8 grid-cols-2']">
      <Product
        v-for="(product, index) in (merchConfig && merchConfig.products || [])"
        :key="index"
        :product-img="product.img"
        :product-name="product.name"
        :product-price="product.price"
        :product-stock="product.stock"
        :product-code="product.code"
      />
    </div>
  </div>
</template>
