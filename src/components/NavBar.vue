<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">MatchLog</router-link>
      </div>
      <ul class="nav-links" :class="{ 'mobile-open': mobileMenuOpen }">
        <li>
          <router-link to="/" @click="toggleMobileMenu">Home</router-link>
        </li>
        <li>
          <router-link to="/about" @click="toggleMobileMenu">About</router-link>
        </li>
        <li v-if="!isAuthenticated">
          <router-link to="/login" @click="toggleMobileMenu" class="login-link">Login</router-link>
        </li>
        <li v-if="!isAuthenticated">
          <router-link to="/register" @click="toggleMobileMenu" class="register-link">Sign Up</router-link>
        </li>
        <li v-if="isAuthenticated" class="user-menu">
          <div class="user-info-display" @click="toggleUserMenu">
            <div class="user-avatar">{{ getUserInitials() }}</div>
            <span class="username-display">{{ currentUser?.username || 'User' }}</span>
            <span class="dropdown-arrow">▼</span>
          </div>
          <div v-if="userMenuOpen" class="user-dropdown">
            <div class="dropdown-header">
              <div class="dropdown-user-info">
                <div class="dropdown-username">{{ currentUser?.username }}</div>
                <div class="dropdown-email">{{ currentUser?.email }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="logout-button">
              Logout
            </button>
          </div>
        </li>
      </ul>
      <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authStore, clearUser } from '../store/authStore.js'
import { logout } from '../clients/authClient.js'

const router = useRouter()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.user)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  userMenuOpen.value = false
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const getUserInitials = () => {
  if (currentUser.value) {
    return currentUser.value.getInitials()
  }
  return 'U'
}

const handleLogout = () => {
  logout()
  clearUser()
  userMenuOpen.value = false
  mobileMenuOpen.value = false
  router.push('/login')
}

// Close user menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const userMenu = document.querySelector('.user-menu')
    if (userMenu && !userMenu.contains(event.target)) {
      userMenuOpen.value = false
    }
  })
})
</script>

<style scoped>
.navbar {
  background: #1e3a8a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.brand-link:hover {
  opacity: 0.8;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links a,
.nav-links .router-link-active {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-links a:hover,
.nav-links .router-link-active:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-links .router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.nav-links .router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background-color: white;
  border-radius: 2px;
}

.login-link {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.register-link {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #1e3a8a !important;
  font-weight: 600 !important;
}

.register-link:hover {
  background: white !important;
  transform: translateY(-2px) !important;
}

.user-menu {
  position: relative;
}

.user-info-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info-display:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.username-display {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.dropdown-arrow {
  color: white;
  font-size: 0.7rem;
  margin-left: 0.25rem;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1001;
  overflow: hidden;
}

.dropdown-header {
  padding: 1rem;
  background: #f9fafb;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-username {
  font-weight: 600;
  color: #1e3a8a;
  font-size: 0.9rem;
}

.dropdown-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
}

.logout-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
  font-size: 0.875rem;
}

.logout-button:hover {
  background: #fee2e2;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-toggle span {
  width: 24px;
  height: 2px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: #1e3a8a;
    flex-direction: column;
    gap: 0;
    padding: 1rem 0;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-links li {
    width: 100%;
  }

  .nav-links a,
  .nav-links .router-link-active {
    display: block;
    width: 100%;
    padding: 1rem 2rem;
    text-align: left;
  }

  .nav-links .router-link-active::after {
    display: none;
  }
}

@media (prefers-color-scheme: light) {
  .navbar {
    background: #1e3a8a;
  }
}
</style>
