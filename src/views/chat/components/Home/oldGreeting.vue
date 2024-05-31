<script setup lang='ts'>
const props = defineProps(['randomPrompt'])
const emit = defineEmits(['fillTextarea'])

function fillTextarea(value: any) {
  emit('fillTextarea', value)
}
</script>

<template>
  <div class="text-gray-800 w-full md:max-w-2xl lg:max-w-3xl md:h-full md:flex md:flex-col px-6 dark:text-gray-100 select-none">
    <h1 class="text-4xl font-semibold text-center ml-auto mr-auto mb-10 sm:mb-16 flex gap-2 items-center justify-center">
      AxiomAI<a class="text-sm bg-[#ECEEF1] dark:bg-white/5 py-1 px-2 rounded-md">preview</a>
    </h1><div class="md:flex items-start text-center gap-3.5">
      <div class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
        <h2 class="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
          <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>Examples
        </h2><ul class="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
          <button class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md animate-in fade-in zoom-in-50 hover:bg-[#67e8f9] dark:hover:bg-[#06b6d4] transition hover:scale-105 shadow-md shadow-cyan-500/50" @click="fillTextarea(props.randomPrompt[0].value)">
            {{ props.randomPrompt[0].key }} →
          </button>
          <button class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md animate-in delay-50 fade-in zoom-in-50 hover:bg-[#60a5fa] dark:hover:bg-[#3b82f6] transition hover:scale-105 shadow-md shadow-blue-500/50" @click="fillTextarea(props.randomPrompt[1].value)">
            {{ props.randomPrompt[1].key }} →
          </button>
          <button class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md animate-in delay-100 fade-in zoom-in-50 hover:bg-[#c084fc] dark:hover:bg-[#a855f7] transition hover:scale-105 shadow-md shadow-purple-500/50" @click="fillTextarea(props.randomPrompt[2].value)">
            {{ props.randomPrompt[2].key }} →
          </button>
        </ul>
      </div><div class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
        <h2 class="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="h-6 w-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>Capabilities
        </h2><ul class="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
          <li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
            Remembers what user said earlier in the conversation
          </li><li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
            Allows user to provide follow-up corrections
          </li><li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
            Trained to decline inappropriate requests
          </li>
        </ul>
      </div><div class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
        <h2 class="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
          <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>Limitations
        </h2><ul class="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
          <li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
            May occasionally generate incorrect information
          </li><li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
            May sometimes generate harmful or biased instructions
          </li><li class="w-full bg-[#ECEEF1] dark:bg-white/5 p-3 rounded-md">
            Last training cut-off date in October 2023
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
