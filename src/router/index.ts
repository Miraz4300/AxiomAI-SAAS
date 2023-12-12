import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { setupPageGuard } from './permission'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: () => import('@/views/chat/layout/Layout.vue'),
    redirect: '/chat',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '/chat/:uuid?',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
      },
      {
        path: '/cognitive-docs',
        name: 'CognitiveDocs',
        component: () => import('@/views/cognitive-docs/index.vue'),
      },
      {
        path: '/whiteboard',
        name: 'Whiteboard',
        component: () => import('@/views/whiteboard/index.vue'),
      },
    ],
  },
  {
    path: '/auth',
    name: 'Auth',
    redirect: '/login',
    meta: {
      hidden: true,
    },
    children: [
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
      },
      {
        path: '/service',
        name: 'Exception',
        component: () => import('@/views/exception/authException/index.vue'),
      },
    ],
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/components/admin/index.vue'),
    meta: {
      requiresAdmin: true,
    },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/components/common/Setting/index.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/iarnf',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
    meta: { skipNav: true },
  },
  {
    path: '/anise',
    name: '500',
    component: () => import('@/views/exception/500/index.vue'),
    meta: { skipNav: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/exception/404/index.vue'),
    meta: { skipNav: true },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}
