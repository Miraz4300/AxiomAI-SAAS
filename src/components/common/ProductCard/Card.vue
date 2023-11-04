<script setup lang='ts'>
const props = defineProps({
  productImg: {
    type: String,
    default: 'loading',
  },
  productName: {
    type: String,
    default: 'loading',
  },
  productStock: {
    type: Boolean,
    default: false,
  },
  productPrice: {
    type: Number,
    default: 0,
  },
  productCode: {
    type: String,
    default: 'loading',
  },
})
</script>

<template>
  <div class="md:flex rounded-lg shadow bg-[#E8EAF1] dark:bg-[#25272D]">
    <div class="relative flex-none md:w-48">
      <img :src="props.productImg" alt="shopping image" class="inset-0 object-cover w-full h-full rounded-lg">
    </div>
    <form class="flex-auto p-6">
      <div class="flex flex-wrap">
        <h1 class="flex-auto text-xl font-semibold dark:text-gray-50">
          {{ props.productName }}
        </h1>
        <div class="text-xl font-semibold dark:text-gray-300">
          ৳ {{ props.productPrice }}
        </div>
        <div class="flex-none w-full mt-2 text-sm font-medium" :class="props.productStock ? 'text-green-600 dark:text-green-400' : 'text-red-400'">
          {{ props.productStock ? 'INSTOCK' : 'STOCKOUT' }}
        </div>
      </div>
      <div class="flex items-baseline space-x-10 mt-4 mb-6 dark:text-gray-300">
        <div class="flex space-x-2">
          <a class="">Size:</a>
          <a class="">M</a>
          <a class="">L</a>
          <a class="">XL</a>
        </div>
        <div class="flex space-x-2">
          <a class="">Code:</a>
          <a class="">{{ productCode }}</a>
        </div>
      </div>
      <div class="flex mb-4 text-sm font-medium">
        <a class="w-full" href="https://forms.office.com/r/vTQhU4k3Fr" target="_blank" rel="noopener noreferrer">
          <button type="button" class="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg ">
            Buy now
          </button>
        </a>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-300">
        Free shipping is available only for supporters
      </p>
    </form>
  </div>
</template>
