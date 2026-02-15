<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">MatchLog</router-link>
      </div>
      
      <!-- Search Bar in Navbar -->
      <div class="navbar-search">
        <SearchBar 
          :suggestions="suggestions"
          :isLoadingSuggestions="isLoadingSuggestions"
          @input="handleInput"
          @search="handleSearch" 
          @clear="handleClearSearch"
          @select-team="handleSelectTeam"
        />
      </div>
      
      <ul class="nav-links" :class="{ 'mobile-open': mobileMenuOpen }">
        <li>
          <router-link to="/" @click="toggleMobileMenu">Home</router-link>
        </li>
        <li>
          <router-link to="/about" @click="toggleMobileMenu">About</router-link>
        </li>
        <li v-if="isAuthenticated">
          <router-link to="/lists" @click="toggleMobileMenu" class="lists-link">
            <span class="link-icon">☰</span>
            My Lists
          </router-link>
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
            <div class="dropdown-header" @click="goToProfile">
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
import SearchBar from './SearchBar.vue'
import { authStore, clearUser } from '../store/authStore.js'
import { logout } from '../clients/authClient.js'
import { useTeamClient } from '../clients/teamClient.js'

const router = useRouter()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

// Search state
const suggestions = ref([])
const isLoadingSuggestions = ref(false)
let debounceTimer = null

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.user)

// Initialize team client
const { getTeamSuggestions } = useTeamClient()

// Handle input changes for suggestions with debouncing
const handleInput = (query) => {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Set new timer
  debounceTimer = setTimeout(async () => {
    if (query && query.length >= 2) {
      try {
        isLoadingSuggestions.value = true
        // Fetch team suggestions from API
        const teams = await getTeamSuggestions(query, 5)
        suggestions.value = teams
      } catch (err) {
        console.error('Failed to fetch suggestions:', err)
        suggestions.value = []
      } finally {
        isLoadingSuggestions.value = false
      }
    } else {
      suggestions.value = []
    }
  }, 300)
}

// Handle search - perform full team search and navigate to first result
const handleSearch = async (teamName) => {
  suggestions.value = []
  try {
    const { searchTeams } = useTeamClient()
    const teams = await searchTeams(teamName, 1)
    if (teams && teams.length > 0) {
      router.push(`/team/${teams[0].id}`)
    }
  } catch (err) {
    console.error('Failed to search teams:', err)
  }
}

// Handle clear search
const handleClearSearch = () => {
  suggestions.value = []
}

// Handle team selection from suggestions
const handleSelectTeam = (team) => {
  suggestions.value = []
  // Navigate to team detail page
  router.push(`/team/${team.id}`)
}

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

const goToProfile = () => {
  if (currentUser.value?.username) {
    userMenuOpen.value = false
    mobileMenuOpen.value = false
    router.push(`/user/${currentUser.value.username}`)
  }
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
  background: #1a1f29;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  border-bottom: 1px solid #2c3440;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  gap: 2rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
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

.navbar-search {
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
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
  color: #9ab;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-links a:hover,
.nav-links .router-link-active:hover {
  background-color: rgba(255, 128, 0, 0.1);
  color: #ff8000;
  transform: translateY(-2px);
}

.nav-links .router-link-active {
  background-color: rgba(255, 128, 0, 0.15);
  color: #ff8000;
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
  background-color: #ff8000;
  border-radius: 2px;
}

.login-link {
  background-color: rgba(255, 128, 0, 0.1) !important;
  color: #ff8000 !important;
}

.register-link {
  background: #ff8000 !important;
  color: white !important;
  font-weight: 600 !important;
}

.register-link:hover {
  background: #e67700 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(255, 128, 0, 0.3) !important;
}

.lists-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.link-icon {
  font-size: 1.125rem;
  line-height: 1;
}

.user-menu {
  position: relative;
}

.user-info-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 128, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.user-info-display:hover {
  background-color: rgba(255, 128, 0, 0.15);
  border-color: #ff8000;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8000 0%, #ffb347 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.username-display {
  color: #cdd;
  font-weight: 500;
  font-size: 0.9rem;
}

.dropdown-arrow {
  color: #9ab;
  font-size: 0.7rem;
  margin-left: 0.25rem;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: #2c3440;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 200px;
  z-index: 1001;
  overflow: hidden;
  border: 1px solid #445566;
}

.dropdown-header {
  padding: 1rem;
  background: #1a1f29;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-header:hover {
  background: rgba(255, 128, 0, 0.1);
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-username {
  font-weight: 600;
  color: #ff8000;
  font-size: 0.9rem;
}

.dropdown-email {
  font-size: 0.75rem;
  color: #9ab;
}

.dropdown-divider {
  height: 1px;
  background: #445566;
}

.logout-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #ff8000;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
  font-size: 0.875rem;
}

.logout-button:hover {
  background: rgba(255, 128, 0, 0.1);
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
    flex-wrap: wrap;
    height: auto;
    min-height: 64px;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }

  .navbar-search {
    order: 3;
    flex: 1 1 100%;
    max-width: 100%;
    margin-top: 0.75rem;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: #1a1f29;
    flex-direction: column;
    gap: 0;
    padding: 1rem 0;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid #2c3440;
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
    background: #1a1f29;
  }
}
</style>
