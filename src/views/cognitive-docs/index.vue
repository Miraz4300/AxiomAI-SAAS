<script lang="ts" setup>
import { NCard, NUpload, NUploadDragger } from 'naive-ui'
import { SvgIcon } from '@/components/common'
</script>

<template>
  <div class="h-full overflow-auto m-auto max-w-screen-lg p-4">
    <div class="my-10 text-center">
      <p class="mb-4 text-3xl font-bold">
        Document Parsing
      </p>
      <p class="text-lg text-neutral-400">
        Upload PDF to easily get intelligent summaries and answers for your documents
      </p>
    </div>
    <div>
      <NUpload
        accept=".pdf"
        directory-dnd
        action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
        :max="1"
      >
        <NUploadDragger>
          <div class="flex flex-col items-center justify-center">
            <SvgIcon icon="solar:upload-square-linear" class="mb-4 text-[100px]" />
            <h2 class="mb-2 text-base font-bold text-black dark:text-white">
              Click or drag and drop files here to upload
            </h2>
            <p class="text-neutral-400">
              <span>File type: PDF</span><span>｜ File size: Up to 10M</span>
            </p>
          </div>
        </NUploadDragger>
      </NUpload>
    </div>

    <footer class="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <NCard>
        <SvgIcon icon="flat-color-icons:document" class="mb-4 text-[46px]" />
        <h2 class="mb-4 text-lg text-black dark:text-white">
          Document Summery
        </h2>
        Intelligently identify key information and quickly create concise summaries to help you grasp the essence of the document.
      </NCard>
      <NCard>
        <SvgIcon icon="flat-color-icons:idea" class="mb-4 text-[46px]" />
        <h2 class="mb-4 text-lg text-black dark:text-white">
          Intelligent Q&A
        </h2>
        Answer questions based on document content and provide professional answers to enhance understanding of the document.
      </NCard>
      <NCard>
        <SvgIcon icon="flat-color-icons:mind-map" class="mb-4 text-[46px]" />
        <h2 class="mb-4 text-lg text-black dark:text-white">
          Content Extraction
        </h2>
        Support reference content to improve reading efficiency.
      </NCard>
    </footer>
  </div>
</template>
