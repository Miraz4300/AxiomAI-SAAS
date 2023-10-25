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
  productSize: {
    type: String,
    default: 'loading',
  },
})
</script>

<template>
  <div class="flex-col md:flex-row justify-between  flex gap-4 items-start mx-4 py-12">
    <div class="mx-auto">
      <div>
        <div class="flex bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="relative flex-none w-24 md:w-48">
            <img :src="props.productImg" alt="shopping image" class="absolute inset-0 object-cover w-full h-full rounded-lg">
          </div>
          <form class="flex-auto p-6">
            <div class="flex flex-wrap">
              <h1 class="flex-auto text-xl font-semibold dark:text-gray-50">
                {{ props.productName }}
              </h1>
              <div class="text-xl font-semibold text-gray-500 dark:text-gray-300">
                {{ props.productPrice }}
              </div>
              <div class="flex-none w-full mt-2 text-sm font-medium" :class="props.productStock ? 'text-green-400' : 'text-red-400'">
                {{ props.productStock ? 'INSTOCK' : 'STOCKOUT' }}
              </div>
            </div>
            <div class="flex items-baseline mt-4 mb-6 text-gray-700 dark:text-gray-300">
              <div class="flex space-x-2">
                <label class="text-center"><input type="radio" class="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-lg dark:bg-gray-600" name="size" value="xs">XS</label><label class="text-center"><input type="radio" class="flex items-center justify-center w-6 h-6" name="size" value="s">S</label><label class="text-center"><input type="radio" class="flex items-center justify-center w-6 h-6" name="size" value="m">M</label><label class="text-center"><input type="radio" class="flex items-center justify-center w-6 h-6" name="size" value="l">L</label><label class="text-center"><input type="radio" class="flex items-center justify-center w-6 h-6" name="size" value="xl">XL</label>
              </div>
              <a
                href="#"
                class="hidden ml-auto text-sm text-gray-500 underline md:block dark:text-gray-300"
              >Size
                Guide
              </a>
            </div>
            <div class="flex mb-4 text-sm font-medium">
              <button type="button" class="py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
                Buy now
              </button>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-300">
              Free shipping is available only for supporters
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
