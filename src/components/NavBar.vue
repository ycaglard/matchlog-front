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
        <li>
          <a href="#" @click.prevent="toggleMobileMenu">Contact</a>
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
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
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
