<script setup lang='ts'>
import { computed, nextTick, onMounted } from 'vue'
import { NInput, NPopconfirm, NScrollbar } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStoreWithout } from '@/store/modules/auth'
import { debounce } from '@/utils/functions/debounce'
import { useisFree } from '@/utils/functions/isFree'

const emit = defineEmits(['update:loadingRoom'])

const { isFree } = useisFree()

const { isMobile } = useBasicLayout()

const appStore = useAppStore()
const chatStore = useChatStore()
const authStore = useAuthStoreWithout()

const dataSources = computed(() => chatStore.getFilteredHistories)

onMounted(async () => {
  if (authStore.session == null || !authStore.session.auth || authStore.token || authStore.session?.authProxyEnabled)
    await handleSyncChatRoom()
})

async function handleSyncChatRoom() {
  emit('update:loadingRoom', true)
  chatStore.syncHistory(() => {
    emit('update:loadingRoom', false)
    // This is not needed here, but when vue renders, the chat may give priority to rendering and other reasons, so the probability is not refreshed
    if (chatStore.active) {
      const uuid = chatStore.active
      chatStore.syncChat({ uuid } as Chat.History, undefined, () => {
        const scrollRef = document.querySelector('#scrollRef')
        if (scrollRef)
          nextTick(() => scrollRef.scrollTop = scrollRef.scrollHeight)
      })
    }
  })
}

async function handleSelect({ uuid }: Chat.History) {
  if (isActive(uuid))
    return

  // It is not necessary here, otherwise each switch is rename
  // if (chatStore.active)
  //   chatStore.updateHistory(chatStore.active, { isEdit: false })
  await chatStore.setActive(uuid)

  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

function handleEdit({ uuid }: Chat.History, isEdit: boolean, event?: MouseEvent) {
  event?.stopPropagation()
  chatStore.updateHistory(uuid, { isEdit })
}

function handleDelete(index: number, event?: MouseEvent | TouchEvent) {
  event?.stopPropagation()
  chatStore.deleteHistory(index)
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

const handleDeleteDebounce = debounce(handleDelete, 600)

function handleEnter({ uuid }: Chat.History, isEdit: boolean, event: KeyboardEvent) {
  event?.stopPropagation()
  if (event.key === 'Enter')
    chatStore.updateHistory(uuid, { isEdit })
}

function isActive(uuid: number) {
  return chatStore.active === uuid
}
</script>

<template>
  <NScrollbar class="px-4">
    <div class="flex flex-col gap-2 text-sm">
      <template v-if="!dataSources.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <SvgIcon icon="fluent:mail-inbox-dismiss-28-regular" class="mb-2 text-3xl" />
          <span>{{ $t('common.noData') }}</span>
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) of dataSources" :key="index">
          <a
            class="relative flex items-center gap-3 px-3 py-3 break-all border rounded-xl cursor-pointer hover:bg-[#F0F4F9] group dark:border-neutral-800 dark:hover:bg-[#1B2129]"
            :class="[
              isActive(item.uuid) ? ['border-[var(--primary-color)]', 'bg-[#F0F4F9]', 'text-[var(--primary-color)]', 'dark:bg-[#1B2129]', 'pr-14'] : '',
              !isFree ? 'animate-in slide-in-from-top-1.5 duration-500 ease-in' : '',
            ]"
            @click="handleSelect(item)"
          >
            <span>
              <SvgIcon icon="lucide:message-square" />
            </span>
            <div class="relative flex-1 overflow-hidden break-all text-ellipsis select-none whitespace-nowrap">
              <NInput
                v-if="item.isEdit"
                v-model:value="item.title" size="tiny"
                @keypress="handleEnter(item, false, $event)"
              />
              <span v-else>{{ item.title }}</span>
            </div>
            <div v-if="isActive(item.uuid)" class="absolute z-10 flex visible right-1">
              <template v-if="item.isEdit">
                <button class="p-1" @click="handleEdit(item, false, $event)">
                  <SvgIcon icon="ri:save-line" />
                </button>
              </template>
              <template v-else>
                <button class="p-1">
                  <SvgIcon icon="ri:edit-line" @click="handleEdit(item, true, $event)" />
                </button>
                <NPopconfirm placement="bottom" @positive-click="handleDeleteDebounce(index, $event)">
                  <template #trigger>
                    <button class="p-1">
                      <SvgIcon icon="ri:delete-bin-line" />
                    </button>
                  </template>
                  {{ $t('chat.deleteHistoryConfirm') }}
                </NPopconfirm>
              </template>
            </div>
          </a>
        </div>
      </template>
    </div>
  </NScrollbar>
</template>
