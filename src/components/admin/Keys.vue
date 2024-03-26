<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NDataTable, NInput, NModal, NSelect, NSpace, NSwitch, NTag, useDialog, useMessage } from 'naive-ui'
import { KeyConfig, Status, UserRole, apiModelOptions, userRoleOptions } from './model'
import { fetchGetKeys, fetchUpdateApiKeyStatus, fetchUpsertApiKey } from '@/api'
import { useAuthStore } from '@/store'
import { SvgIcon } from '@/components/common'

const ms = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const loading = ref(false)
const show = ref(false)
const handleSaving = ref(false)
const keyConfig = ref(new KeyConfig('', 'ChatGPTAPI', [], [], ''))
const keys = ref([])

const createColumns = (): DataTableColumns => {
  return [
    {
      title: 'API Key',
      key: 'key',
      resizable: true,
      width: 120,
      minWidth: 50,
      maxWidth: 120,
      ellipsis: true,
    },
    {
      title: 'Endpoint',
      key: 'keyModel',
      width: 150,
    },
    {
      title: 'Base URL',
      key: 'baseUrl',
      width: 170,
      ellipsis: true,
    },
    {
      title: 'Models',
      key: 'chatModels',
      width: 350,
      render(row: any) {
        const tags = row.chatModels.map((chatModel: string) => {
          return h(
            NTag,
            {
              style: {
                marginRight: '6px',
                marginTop: '6px',
              },
              type: 'info',
              bordered: false,
            },
            chatModel,
          )
        })
        return tags
      },
    },
    {
      title: 'Roles',
      key: 'userRoles',
      width: 200,
      render(row: any) {
        const tags = row.userRoles.map((userRole: UserRole) => {
          return h(
            NTag,
            {
              style: {
                marginRight: '6px',
                marginTop: '6px',
              },
              type: 'info',
              bordered: false,
            },
            UserRole[userRole],
          )
        })
        return tags
      },
    },
    {
      title: 'Remark',
      key: 'remark',
      width: 200,
    },
    {
      title: 'Actions',
      key: '_id',
      width: 220,
      fixed: 'right',
      render: (row: any) => {
        const actions: any[] = []
        if (row.status === Status.Normal) {
          actions.push(h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              style: {
                marginRight: '6px',
              },
              onClick: () => handleEditKey(row),
            },
            {
              default: () => [
                h(SvgIcon, { icon: 'ri:edit-2-line' }),
                h('span', { class: 'ml-1' }, 'Edit Key'),
              ],
            },
          ))
        }
        actions.push(h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleUpdateApiKeyStatus(row._id as string, Status.Disabled),
          },
          {
            default: () => [
              h(SvgIcon, { icon: 'ri:delete-bin-6-line' }),
              h('span', { class: 'ml-1' }, 'Delete'),
            ],
          },
        ))
        return actions
      },
    },
  ]
}

const columns = createColumns()

const pagination = reactive({
  page: 1,
  pageSize: 100,
  pageCount: 1,
  itemCount: 1,
  prefix({ itemCount }: { itemCount: number | undefined }) {
    return `Total key: ${itemCount}`
  },
  showSizePicker: true,
  pageSizes: [100],
  onChange: (page: number) => {
    pagination.page = page
    handleGetKeys(pagination.page)
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    handleGetKeys(pagination.page)
  },
})
async function handleGetKeys(page: number) {
  if (loading.value)
    return
  keys.value.length = 0
  loading.value = true
  const size = pagination.pageSize
  const data = (await fetchGetKeys(page, size)).data
  data.keys.forEach((key: never) => {
    keys.value.push(key)
  })
  keyConfig.value = keys.value[0]
  pagination.page = page
  pagination.pageCount = data.total / size + (data.total % size === 0 ? 0 : 1)
  pagination.itemCount = data.total
  loading.value = false
}
async function handleUpdateApiKeyStatus(id: string, status: Status) {
  dialog.error({
    title: ('Delete Key'),
    content: ('Are you sure to delete this key?'),
    positiveText: ('Yes'),
    negativeText: ('No'),
    onPositiveClick: async () => {
      await fetchUpdateApiKeyStatus(id, status)
      ms.info('OK')
      await handleGetKeys(pagination.page)
    },
  })
}
async function handleUpdateKeyConfig() {
  if (!keyConfig.value.key) {
    ms.error('API key is required')
    return
  }
  handleSaving.value = true
  try {
    await fetchUpsertApiKey(keyConfig.value)
    await handleGetKeys(pagination.page)
    show.value = false
  }
  catch (error: any) {
    ms.error(error.message)
  }
  handleSaving.value = false
}
function handleNewKey() {
  keyConfig.value = new KeyConfig('', 'ChatGPTAPI', [], [], '')
  show.value = true
}
function handleEditKey(key: KeyConfig) {
  keyConfig.value = key
  show.value = true
}
onMounted(async () => {
  await handleGetKeys(pagination.page)
})
</script>

<template>
  <div class="p-4 space-y-5 md:max-h-[740px] sm:min-h-[740px]">
    <div class="space-y-6">
      <NSpace vertical :size="12">
        <NSpace>
          <NButton @click="handleNewKey()">
            <template #icon>
              <SvgIcon icon="ri:add-line" />
            </template>
            Add Key
          </NButton>
        </NSpace>
        <NDataTable
          remote
          :loading="loading"
          :row-key="(rowData) => rowData._id"
          :columns="columns"
          :data="keys"
          :pagination="pagination"
          :max-height="580"
          :scroll-x="1300"
          striped @update:page="handleGetKeys"
        />
      </NSpace>
    </div>
  </div>

  <NModal v-model:show="show" :auto-focus="false" preset="card" title="Key Information" style="width: 95%; max-width: 980px">
    <div class="p-4 space-y-5 min-h-[200px]">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Endpoint</span>
        <div class="flex-1">
          <NSelect
            style="width: 100%"
            :value="keyConfig.keyModel"
            :options="apiModelOptions"
            @update-value="value => keyConfig.keyModel = value"
          />
        </div>
        <a v-if="keyConfig.keyModel === 'ChatGPTAPI'" target="_blank" href="https://platform.openai.com/account/api-keys">Get API Key</a>
        <a v-else target="_blank" href="https://chat.openai.com/api/auth/session">Get Access Token</a>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">API Key</span>
        <div class="flex-1">
          <NInput
            v-model:value="keyConfig.key" type="textarea"
            :autosize="{ minRows: 3, maxRows: 4 }" placeholder=""
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Base URL</span>
        <div class="flex-1">
          <NInput
            v-model:value="keyConfig.baseUrl"
            style="width: 100%" placeholder="If empty, default base url will be used from system setting"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Models</span>
        <div class="flex-1">
          <NSelect
            style="width: 100%"
            multiple
            :value="keyConfig.chatModels"
            :options="authStore.session?.chatModels"
            @update-value="value => keyConfig.chatModels = value"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Roles</span>
        <div class="flex-1">
          <NSelect
            style="width: 100%"
            multiple
            :value="keyConfig.userRoles"
            :options="userRoleOptions"
            @update-value="(value: UserRole[]) => keyConfig.userRoles = value"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Enabled</span>
        <div class="flex-1">
          <NSwitch
            :round="false"
            :value="keyConfig.status === Status.Normal"
            @update:value="(val: any) => { keyConfig.status = val ? Status.Normal : Status.Disabled }"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Remark</span>
        <div class="flex-1">
          <NInput
            v-model:value="keyConfig.remark" type="textarea"
            :autosize="{ minRows: 1, maxRows: 2 }" placeholder="" style="max-width: 50%"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]" />
        <NButton type="primary" :loading="handleSaving" @click="handleUpdateKeyConfig()">
          {{ $t('common.save') }}
        </NButton>
      </div>
    </div>
  </NModal>
</template>
