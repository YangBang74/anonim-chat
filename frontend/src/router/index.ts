import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import Room from '@/views/Room.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Home },
  { path: '/find', name: 'Find Chat', component: () => import('@/views/FindChat.vue') },
  { path: '/room/:id', name: 'Room', component: Room, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
