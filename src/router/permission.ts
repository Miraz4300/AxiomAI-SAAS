import type { Router } from 'vue-router'
import { useAuthStoreWithout, useUserStore } from '@/store'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()
    const userStore = useUserStore()

    if (!to.meta.requiresAuth && !to.meta.requiresAdmin)
      return next()
    try {
      const data = await authStore.getSession()
      if (String(data.auth) === 'false' && authStore.token)
        await authStore.removeToken()

      const token = authStore.token
      if (!token)
        return next({ name: 'Login' })

      if (to.meta.requiresAdmin && !userStore.userInfo.root)
        return next({ name: '404' })
      next()
    }
    catch (error) {
      next({ name: '500' })
    }
  })
}
