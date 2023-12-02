<template>
  <div class="flex min-h-full w-screen flex-col sm:supports-[min-height:100dvh]:min-h-[100dvh] md:grid md:grid-cols-2 lg:grid-cols-[50%_50%]">
    <div class="relative hidden flex-1 flex-col justify-center px-5 pt-8 md:flex md:px-6 md:py-[22px] lg:px-8 dark:bg-black bg-slate-800">
      <div class="relative flex w-full grow flex-col items-center justify-center">
        <div class="flex gap-4 items-center select-none">
          <img class="w-[110px] h-[110px]" src="/favicon.png" alt="AxiomAI Logo" draggable="false">
          <p class="flex gap-2 font-logo text-white font-semibold text-6xl text-center">
            <span class="flex py-2 items-center flex-col">
              AxiomAI
              <span class="font-light text-sm typewriter">powered by GPT</span>
            </span>
          </p>
        </div>
      </div>
    </div>
    <div class="relative flex grow flex-col items-center justify-between px-5 py-8 md:px-6 bg-white dark:bg-[#00002E]">
      <div class="relative flex w-full grow flex-col items-center justify-center">
        <slot />
      </div>
      <div class="mt-10 flex flex-col justify-center items-center">
        <div class="flex gap-1 items-center select-none">
          <img class="w-[24px] h-[24px]" src="/favicon.png" alt="AxiomAI Logo" draggable="false">
          <p class="flex gap-2 font-logo text-black dark:text-white font-semibold text-lg text-center">
            <span class="flex py-2 items-center flex-col">
              AxiomAI
            </span>
          </p>
        </div>
        <a class="py-2 text-xs text-black dark:text-gray-500">AxiomAI © 2023 | Deepspacelab Corp.</a>
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
