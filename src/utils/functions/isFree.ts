import { computed } from 'vue'
import { useUserStore } from '@/store'
import { UserRole } from '@/components/admin/model'

export function useisFree() {
  const userStore = useUserStore()
  const userInfo = computed(() => userStore.userInfo)
  const Role = userInfo.value.roles[0]

  const isFree = computed(() => Role === UserRole.Free)

  return { isFree }
}
