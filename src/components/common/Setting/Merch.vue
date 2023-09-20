<script setup lang="ts">
import { NButton, NCard, NCarousel } from 'naive-ui'
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-center">
      <NCarousel autoplay effect="custom" :transition-props="{ name: 'creative' }" show-arrow style="width: 100%; height: 240px">
        <img
          class="carousel-img"
          src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg"
        >
        <img
          class="carousel-img"
          src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg"
        >
        <img
          class="carousel-img"
          src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg"
        >
        <img
          class="carousel-img"
          src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg"
        >
      </NCarousel>
    </div>
    <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-4">
      <NCard title="Premium" hoverable>
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
          <NButton strong secondary type="primary">
            Buy
          </NButton>
        </div>
      </NCard>
      <NCard title="Premium" hoverable>
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
          <NButton strong secondary type="primary">
            Buy
          </NButton>
        </div>
      </NCard>
      <NCard title="Premium" hoverable>
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
          <NButton strong secondary type="primary">
            Buy
          </NButton>
        </div>
      </NCard>
      <NCard title="Premium" hoverable>
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
          <NButton strong secondary type="primary">
            Buy
          </NButton>
        </div>
      </NCard>
      <NCard title="Premium" hoverable>
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
          <NButton strong secondary type="primary">
            Buy
          </NButton>
        </div>
      </NCard>
      <NCard title="Premium" hoverable>
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
          <NButton strong secondary type="primary">
            Buy
          </NButton>
        </div>
      </NCard>
      <NCard title="Premium" hoverable>
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
          <NButton strong secondary type="primary">
            Buy
          </NButton>
        </div>
      </NCard>
      <NCard title="Premium" hoverable>
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
          <NButton strong secondary type="primary">
            Buy
          </NButton>
        </div>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
.carousel-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

:deep(.creative-enter-from),
:deep(.creative-leave-to) {
  opacity: 0;
  transform: scale(0.8);
}

:deep(.creative-enter-active),
:deep(.creative-leave-active) {
  transition: all 0.3s ease;
}
</style>
