<template>
  <div class="relative hidden flex-1 flex-col justify-center px-5 pt-8 md:flex md:px-6 md:py-[22px] lg:px-8 bg-[#E8EAF1] dark:bg-black">
    <div class="relative flex w-full grow flex-col items-center justify-center">
      <div class="flex gap-4 items-center select-none">
        <div class="bg-brand-logo bg-contain w-[95px] h-[95px]" draggable="false" />
        <p class="flex flex-col font-logo text-black dark:text-white font-semibold antialiased text-center">
          <a class="text-6xl">AxiomAI</a>
          <a class="font-light text-sm typewriter">powered by GPT</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.typewriter {
  overflow: hidden;
  border-right: 0.15em solid orange;
  white-space: nowrap;
  margin: 0 auto;
  letter-spacing: 0.12em;
  animation: typing 1.5s steps(29, end) forwards, blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
    border-right: none;
  }
}
</style>
