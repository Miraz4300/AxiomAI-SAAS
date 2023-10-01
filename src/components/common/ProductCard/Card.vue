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
})
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="container">
      <div class="w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-lg">
        <div class="flex flex-col">
          <div class="h-62 relative mb-3 w-full">
            <img :src="props.productImg">
          </div>
          <div class="flex-auto justify-evenly">
            <div class="flex flex-wrap">
              <div class="flex w-full flex-none items-center text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="mr-3 whitespace-nowrap text-gray-400">4.60</span><span class="mr-2 text-gray-400">Dhaka</span>
              </div>
              <div class="flex w-full min-w-0 items-center justify-between">
                <h2 class="mr-auto cursor-pointer truncate text-lg text-gray-200 hover:text-purple-500">
                  {{ props.productName }}
                </h2>
                <div class="ml-3 flex items-center rounded-lg px-2 py-1 text-xs text-white" :class="props.productStock ? 'bg-green-400' : 'bg-red-400'">
                  {{ props.productStock ? 'INSTOCK' : 'STOCKOUT' }}
                </div>
              </div>
            </div>
            <div class="mt-1 text-xl font-semibold text-white">
              ৳{{ props.productPrice }}
            </div>
            <div class="py-4 text-sm text-gray-600 lg:flex">
              <div class="mb-3 inline-flex flex-1 items-center">
                <div class="flex w-full flex-none items-center text-sm text-gray-600">
                  <ul class="flex flex-row items-center justify-center space-x-2">
                    <li class="">
                      <span class="block rounded-full border-2 border-gray-900 p-1 transition duration-300 ease-in hover:border-blue-600">
                        <a href="#blue" class="block h-3 w-3 rounded-full bg-blue-600" />
                      </span>
                    </li>
                    <li class="">
                      <span class="block rounded-full border-2 border-gray-900 p-1 transition duration-300 ease-in hover:border-yellow-400">
                        <a href="#yellow" class="block h-3 w-3 rounded-full bg-yellow-400" />
                      </span>
                    </li>
                    <li class="">
                      <span class="block rounded-full border-2 border-gray-900 p-1 transition duration-300 ease-in hover:border-red-500">
                        <a href="#red" class="block h-3 w-3 rounded-full bg-red-500" />
                      </span>
                    </li>
                    <li class="">
                      <span class="block rounded-full border-2 border-gray-900 p-1 transition duration-300 ease-in hover:border-green-500">
                        <a href="#green" class="block h-3 w-3 rounded-full bg-green-500" />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="mb-3 inline-flex flex-1 items-center">
                <span class="text-secondary mr-3 whitespace-nowrap">Size</span>
                <div class="cursor-pointer text-gray-400">
                  <span class="p-1 py-0 hover:text-purple-500">S</span>
                  <span class="p-1 py-0 hover:text-purple-500">M</span>
                  <span class="p-1 py-0 hover:text-purple-500">L</span>
                  <span class="p-1 py-0 hover:text-purple-500">XL</span>
                  <span class="p-1 py-0 hover:text-purple-500">XXL</span>
                </div>
              </div>
            </div>
            <div class="flex justify-start space-x-2 text-sm font-medium">
              <button class="mb-2 inline-flex items-center rounded-full bg-purple-500 px-5 py-2 text-sm font-medium tracking-wider text-white transition duration-300 ease-in hover:bg-purple-600 hover:shadow-lg md:mb-0">
                <span>Buy now</span>
                <slot />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
