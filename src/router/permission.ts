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

      else
        await useUserStore().updateUserInfo(false, data.userInfo)

      if (!!authStore.session?.auth && !authStore.token)
        return next({ name: 'Login' }) // Redirect to Login page if token is missing

      if (to.meta.requiresAdmin && !userStore.userInfo.root)
        return next({ name: '404' }) // Redirect to 404 page if admin access is required

      next() // Continue navigation
    }
    catch (error) {
      next({ name: 'Login' }) // Redirect to Login page in case of error
    }
  })
}
