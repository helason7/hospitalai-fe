import { createRouter, createWebHistory } from 'vue-router'
import UserView from '../views/UserView.vue'
import AdminView from '../views/AdminView.vue'
import AdminLogin from '../views/AdminLogin.vue'

const routes = [
  {
    path: '/',
    name: 'UserView',
    component: UserView
  },
  {
    path: '/login',
    redirect: '/admin/login'
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { guestOnly: true }
  },
  {
    path: '/admin',
    name: 'AdminView',
    component: AdminView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard untuk memproteksi rute Admin
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      // Belum login, alihkan ke login page dengan info redirect target
      next({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    if (token) {
      // Jika sudah login dan mencoba ke halaman login, langsung ke dashboard
      next({ path: '/admin' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
