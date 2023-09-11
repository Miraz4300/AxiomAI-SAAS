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

      if (String(data.auth) === 'false' && authStore.token) {
        await authStore.removeToken()
        return next({ name: 'Login', query: { redirect: to.fullPath } }) // Added redirection path
      }

      else { await useUserStore().updateUserInfo(false, data.userInfo) }

      if (!!authStore.session?.auth && !authStore.token)
        return next({ name: 'Login', query: { redirect: to.fullPath } }) // Added redirection path

      if (to.meta.requiresAdmin && !userStore.userInfo.root)
        return next({ name: '404' }) // Redirect to not found page

      next() // Continue navigation
    }
    catch (error) {
      console.error('Error during route guard: ', error)
      next({ name: '500' }) // Redirect to Error page in case of non-authentication related errors
    }
  })
}
