import type { Router } from 'vue-router'
import { useAuthStoreWithout, useUserStore } from '@/store'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()
    const userStore = useUserStore()
    if (!authStore.session) {
      try {
        const data = await authStore.getSession()
        if (String(data.auth) === 'false' && authStore.token)
          await authStore.removeToken()
        if (to.path === '/500')
          next({ name: 'Root' })
        if (to.meta.requiresAdmin && !userStore.userInfo.root)
          return next({ name: '404' })
        else
          next()
      }
      catch (error) {
        if (to.path !== '/500')
          next({ name: '500' })
        else
          next()
      }
    }
    else {
      next()
    }
  })
}
