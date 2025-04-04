import type { Router } from 'vue-router'
import { useAuthStoreWithout, useUserStore } from '@/store'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // Start the loading bar before each navigation
    window.$loadingBar?.start()

    const authStore = useAuthStoreWithout()
    const userStore = useUserStore()

    // If the user is already authenticated and tries to access the auth page, redirect them to the chat page.
    if (to.path === '/auth/login' && authStore.token)
      return next({ name: 'Chat' })

    // If the user tries to access the 2FA/MFA page without temporary credentials, redirect them to the auth page.
    if (to.path === '/auth/login/security' && !authStore.tuc)
      return next({ name: 'Auth' })

    if (!to.meta.requiresAuth && !to.meta.requiresAdmin)
      return next()

    try {
      const data = await authStore.getSession()

      if (String(data.auth) === 'false' && authStore.token) {
        await authStore.removeToken()
        return next({ name: 'Auth', query: { redirect: to.fullPath } }) // Redirect to auth page in case of invalid token
      }

      else { await useUserStore().updateUserInfo(false, data.userInfo) }

      if (!!authStore.session?.auth && !authStore.token && !authStore.session?.authProxyEnabled)
        return next({ name: 'Auth', query: { redirect: to.fullPath } }) // Redirect to auth page in case of unauthenticated users

      if (to.meta.requiresAdmin && !userStore.userInfo.root)
        return next({ name: '404' }) // Redirect to not found page in case of non-admin users

      next()
    }
    catch (error) {
      console.error('Error during route guard: ', error)
      if ((error as Error).message.includes('Cannot read properties of null')) {
        await authStore.removeToken()
        return next({ name: 'Auth', query: { redirect: to.fullPath } }) // Redirect to auth page in case of invalid token | TODO: Check if this is the correct error message
      }
      else {
        window.$loadingBar?.error() // Show loading bar as error
        next({ name: '500' }) // Redirect to Error page in case of non-authentication related errors
      }
    }
  })

  router.afterEach(() => {
    // Stop the loading bar after each navigation, regardless of whether it was successful or not
    window.$loadingBar?.finish()
  })
}
