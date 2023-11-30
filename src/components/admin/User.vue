<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
import { NAvatar, NButton, NDataTable, NInput, NModal, NSelect, NSpace, NTag, useDialog, useMessage } from 'naive-ui'
import { Status, UserInfo, UserRole, userRoleOptions } from './model'
import { fetchDisableUser2FAByAdmin, fetchGetUsers, fetchUpdateUser, fetchUpdateUserStatus } from '@/api'
import { SvgIcon } from '@/components/common'

const ms = useMessage()
const dialog = useDialog()
const loading = ref(false)
const show = ref(false)
const handleSaving = ref(false)
const userRef = ref(new UserInfo([UserRole.Free]))
const users = ref<UserInfo[]>([])
const searchQuery = ref('')
const defaultAvatar = '/assets/avatar_1.jpg'
const columns = [
  {
    title: 'Email',
    key: 'email',
    resizable: true,
    width: 200,
    minWidth: 100,
    maxWidth: 200,
    render(row: any) {
      return h('div', { class: 'flex items-center gap-3' }, {
        default: () => [
          h(NAvatar, {
            round: true,
            size: 'medium',
            src: row.avatar ? row.avatar : defaultAvatar,
          }),
          h('span', { class: 'font-medium antialiased' }, row.email),
        ],
      })
    },
  },
  {
    title: 'Registration Time',
    key: 'createTime',
    width: 170,
  },
  {
    title: 'Verification Time',
    key: 'verifyTime',
    width: 170,
  },
  {
    title: 'Roles',
    key: 'status',
    width: 120,
    render(row: any) {
      const roles = row.roles.map((role: UserRole) => {
        const tagType = (() => {
          if (role === UserRole.Premium)
            return 'success'
          if (role === UserRole.MVP)
            return 'warning'
          if (role === UserRole.Support)
            return 'success'
          if (role === UserRole.Enterprise)
            return 'error'
          if (role === UserRole.Basic || role === UserRole['Basic+'])
            return 'info'
          return 'default'
        })()
        return h(
          NTag,
          {
            style: {
              marginRight: '6px',
            },
            type: tagType,
            bordered: false,
          },
          {
            default: () => UserRole[role],
          },
        )
      })
      return roles
    },
  },
  {
    title: 'Status',
    key: 'status',
    width: 100,
    render(row: any) {
      const status = Status[row.status]
      const tagType = (() => {
        if (row.status === Status.Normal)
          return 'success'
        if (row.status === Status.Unverified)
          return 'warning'
        if (row.status === Status.Disabled)
          return 'error'
        return 'default'
      })()
      return h(
        NTag,
        {
          style: {
            marginRight: '6px',
          },
          type: tagType,
        },
        {
          default: () => status,
        },
      )
    },
  },
  {
    title: 'Remark',
    key: 'remark',
    width: 210,
  },
  {
    title: 'Actions',
    key: '_id',
    width: 220,
    render(row: any) {
      const actions: any[] = []

      if (row.status !== Status.Disabled) {
        actions.push(h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: {
              marginRight: '6px',
            },
            onClick: () => handleUpdateUserStatus(row._id, Status.Disabled, 'disable'),
          },
          {
            default: () => [
              h(SvgIcon, { icon: 'mdi:user-off-outline' }),
              h('span', { class: 'ml-1' }, 'Disable'),
            ],
          },
        ))
      }
      if (row.status === Status.Disabled) {
        actions.push(h(
          NButton,
          {
            size: 'small',
            strong: true,
            secondary: true,
            type: 'success',
            style: {
              marginRight: '6px',
            },
            onClick: () => handleUpdateUserStatus(row._id, Status.Normal, 'restore'),
          },
          {
            default: () => [
              h(SvgIcon, { icon: 'mdi:account-check' }),
              h('span', { class: 'ml-1' }, 'Restore'),
            ],
          },
        ))
      }
      if (row.status === Status.Normal) {
        actions.push(h(
          NButton,
          {
            size: 'small',
            type: 'default',
            style: {
              marginRight: '8px',
            },
            onClick: () => handleEditUser(row),
          },
          {
            default: () => [
              h(SvgIcon, { icon: 'ri:edit-2-line' }),
              h('span', { class: 'ml-1' }, 'Edit User'),
            ],
          },
        ))
      }
      if (row.status === Status.Unverified || row.status === Status.AdminVerify) {
        actions.push(h(
          NButton,
          {
            size: 'small',
            type: 'info',
            onClick: () => handleUpdateUserStatus(row._id, Status.Normal, 'verify'),
          },
          {
            default: () => [
              h(SvgIcon, { icon: 'ri:verified-badge-line' }),
              h('span', { class: 'ml-1' }, 'Verified'),
            ],
          },
        ))
      }
      if (row.secretKey) {
        actions.push(h(
          NButton,
          {
            size: 'small',
            type: 'warning',
            onClick: () => handleDisable2FA(row._id),
          },
          {
            default: () => [
              h(SvgIcon, { icon: 'mdi:shield-off' }),
              h('span', { class: 'ml-1' }, 'Disable 2FA'),
            ],
          },
        ))
      }
      return actions
    },
  },
]
const pagination = reactive ({
  page: 1,
  pageSize: 50,
  pageCount: 1,
  itemCount: 1,
  prefix({ itemCount }: { itemCount: number | undefined }) {
    return `Total user: ${itemCount}`
  },
  showSizePicker: true,
  pageSizes: [25, 50, 100],
  onChange: (page: number) => {
    pagination.page = page
    handleGetUsers(pagination.page)
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    handleGetUsers(pagination.page)
  },
})

const duration = ref()
const durationOption = ref([
  { label: '3 Days', value: 3 },
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
])

async function handleGetUsers(page: number) {
  if (loading.value)
    return
  users.value.length = 0
  loading.value = true
  const size = pagination.pageSize
  const data = (await fetchGetUsers(page, size)).data
  data.users.forEach((user: never) => {
    users.value.push(user)
  })
  pagination.page = page
  pagination.pageCount = data.total / size + (data.total % size === 0 ? 0 : 1)
  pagination.itemCount = data.total
  loading.value = false
}

async function handleUpdateUserStatus(userId: string, status: Status, action: string) {
  if (status === Status.Disabled) {
    if (action === 'disable') {
      dialog.error({
        title: ('Disable Account'),
        content: ('Are you sure to disable this user account?'),
        positiveText: ('Yes'),
        negativeText: ('No'),
        onPositiveClick: async () => {
          await fetchUpdateUserStatus(userId, status)
          ms.info('Account disabled')
          await handleGetUsers(pagination.page)
        },
      })
    }
  }
  else if (status === Status.Normal) {
    if (action === 'restore') {
      dialog.success({
        title: ('Restore Account'),
        content: ('Are you sure to restore this user account?'),
        positiveText: ('Yes'),
        negativeText: ('No'),
        onPositiveClick: async () => {
          await fetchUpdateUserStatus(userId, status)
          ms.info('Account restored')
          await handleGetUsers(pagination.page)
        },
      })
    }
    else if (action === 'verify') {
      dialog.info({
        title: ('Verify Account'),
        content: ('Are you sure to verify this user account?'),
        positiveText: ('Yes'),
        negativeText: ('No'),
        onPositiveClick: async () => {
          await fetchUpdateUserStatus(userId, status)
          ms.info('Account verified')
          await handleGetUsers(pagination.page)
        },
      })
    }
  }
  else {
    await fetchUpdateUserStatus(userId, status)
    ms.info('OK')
    await handleGetUsers(pagination.page)
  }
}

async function handleDisable2FA(userId: string) {
  dialog.warning({
    title: ('Disable 2FA'),
    content: ('Are you sure to disable 2FA for this user?'),
    positiveText: ('Yes'),
    negativeText: ('No'),
    onPositiveClick: async () => {
      const result = await fetchDisableUser2FAByAdmin(userId)
      ms.success(result.message as string)
      await handleGetUsers(pagination.page)
    },
  })
}

function handleNewUser() {
  userRef.value = new UserInfo([UserRole.Free])
  show.value = true
}

async function handleSearch() {
  const query = searchQuery.value.toLowerCase().trim() // Convert to lowercase for case-insensitive search
  if (query === '') {
    // If search query is empty, show all users
    await handleGetUsers(pagination.page)
  }
  else {
    // Fetch the filtered data from the server
    const filteredData = await fetchGetUsers(1, pagination.itemCount, query)
    // Update the users array with the filtered results
    users.value.length = 0
    filteredData.data.users.forEach((user: never) => {
      users.value.push(user)
    })
    // Update pagination information
    pagination.page = 1
    pagination.pageCount = filteredData.data.total / pagination.pageSize + (filteredData.data.total % pagination.pageSize === 0 ? 0 : 1)
    pagination.itemCount = filteredData.data.total
  }
}

function handleEditUser(user: UserInfo) {
  userRef.value = user
  show.value = true
}

async function handleUpdateUser() {
  handleSaving.value = true
  try {
    if (duration.value) {
    // Calculate the expiration date as dd-mm-yyyy, hh:mm AM/PM format
      const currentDate = new Date()
      currentDate.setDate(currentDate.getDate() + duration.value)
      const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}, ${currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
      userRef.value.remark = `Expires on ${formattedDate}`
    }

    await fetchUpdateUser(userRef.value)
    await handleGetUsers(pagination.page)
    show.value = false
  }
  catch (error: any) {
    ms.error(error.message)
  }
  handleSaving.value = false
}

onMounted(async () => {
  await handleGetUsers(pagination.page)
})
</script>

<template>
  <div class="p-4 space-y-5 md:max-h-[740px] sm:min-h-[740px]">
    <div class="space-y-6">
      <NSpace vertical :size="12">
        <NSpace justify="space-between">
          <NButton @click="handleNewUser()">
            <template #icon>
              <SvgIcon icon="ri:add-line" />
            </template>
            Add User
          </NButton>
          <div class="flex space-x-2">
            <NInput v-model:value="searchQuery" placeholder="Search by email address" clearable />
            <NButton @click="handleSearch">
              <template #icon>
                <SvgIcon icon="ri:search-line" />
              </template>
              Search
            </NButton>
          </div>
        </NSpace>
        <NDataTable
          remote
          :loading="loading"
          :row-key="(rowData) => rowData._id"
          :columns="columns"
          :data="users"
          :pagination="pagination"
          :max-height="580"
          striped
          :scroll-x="1260"
          @update:page="handleGetUsers"
        />
      </NSpace>
    </div>
  </div>

  <NModal v-model:show="show" :auto-focus="false" preset="card" title="Account Information" style="width: 95%; max-width: 720px">
    <div class="p-4 space-y-5 min-h-[200px]">
      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]" />
          <div class="flex-1">
            <NAvatar
              round
              :size="120"
              :src="userRef.avatar ? userRef.avatar : defaultAvatar"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Email</span>
          <div class="flex-1">
            <NInput
              v-model:value="userRef.email"
              :disabled="userRef._id !== undefined" placeholder="user email address"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Password</span>
          <div class="flex-1">
            <NInput
              v-model:value="userRef.password"
              type="password"
              placeholder="authentication password"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Roles</span>
          <div class="flex-1">
            <NSelect
              style="width: 100%"
              multiple
              :value="userRef.roles"
              :options="userRoleOptions"
              @update-value="(value: UserRole[]) => userRef.roles = value"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Duration</span>
          <div class="flex-1">
            <NSelect
              v-model:value="duration"
              style="width: 100%"
              :options="durationOption"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">Remark</span>
          <div class="flex-1">
            <NInput
              v-model:value="userRef.remark" type="textarea" clearable
              :autosize="{ minRows: 1, maxRows: 2 }" placeholder=""
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]" />
          <NButton type="primary" :loading="handleSaving" @click="handleUpdateUser()">
            {{ $t('common.save') }}
          </NButton>
        </div>
      </div>
    </div>
  </NModal>
</template>
