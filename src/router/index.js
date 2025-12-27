import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import MatchDetail from '../views/MatchDetail.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import { isAuthenticated } from '../clients/authClient.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/match/:id',
    name: 'MatchDetail',
    component: MatchDetail,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuth = isAuthenticated()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuth) {
    // Redirect to login if not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  // Check if route requires guest (login/register pages)
  else if (to.meta.requiresGuest && isAuth) {
    // Redirect to home if already authenticated
    next({ name: 'Home' })
  }
  else {
    // Proceed normally
    next()
  }
})

export default router

