import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import Room from '@/views/Room.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Home, meta: { layout: 'default' } },
  {
    path: '/find',
    name: 'Find Chat',
    component: () => import('@/views/FindChat.vue'),
    meta: { layout: 'default' },
  },
  { path: '/room/:id', name: 'Room', component: Room, props: true, meta: { layout: 'default' } },
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  routes,
})

export default router
