<template>
  <div class="text-gray-800 w-full md:max-w-xl lg:max-w-xl md:h-full md:flex md:flex-col px-6 dark:text-gray-100 select-none">
    <div class="flex justify-center gap-2 items-center mb-14">
      <div class="bg-brand-logo bg-contain w-[36px] h-[36px]" draggable="false" />
      <p class="flex flex-col text-black dark:text-white font-semibold antialiased text-center">
        <a class="text-4xl">AxiomAI</a>
      </p>
    </div>
    <div class="md:flex items-start text-center gap-3.5">
      <div class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
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
      </div>
      <div class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
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
