import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Home, meta: { layout: 'default' } },
  {
    path: '/find',
    name: 'Find Chat',
    component: () => import('@/views/FindChat.vue'),
    meta: { layout: 'default' },
  },
    {
    path: '/friends',
    name: 'Chat with Friends',
    component: () => import('@/views/Friends.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/room/:id',
    name: 'Room',
    component: () => import('@/views/Room.vue'),
    props: true,
    meta: { layout: 'without' },
  },
  {
    path: '/invite/:code',
    name: 'Invite',
    component: () => import('@/views/Invite.vue'),
    props: true,
    meta: { layout: 'default' },
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/Terms.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/Privacy.vue'),
    meta: { layout: 'default' },
  },
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
