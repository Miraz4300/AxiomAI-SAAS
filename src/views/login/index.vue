<script setup lang="ts">
import AuthLayout from './components/AuthLayout.vue'
import AuthIntro from './components/AuthIntro.vue'
</script>

<template>
  <div class="flex min-h-full w-screen flex-col sm:supports-[min-height:100dvh]:min-h-[100dvh] md:grid md:grid-cols-2 lg:grid-cols-[55%_45%]">
    <AuthIntro />
    <AuthLayout />
  </div>
</template>
