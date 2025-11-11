import { reactive, readonly } from 'vue'
import { getStoredUser, isAuthenticated } from '../clients/authClient.js'

/**
 * Global authentication store
 * Manages user state across the application
 */
const state = reactive({
  user: getStoredUser(),
  isAuthenticated: isAuthenticated(),
  isLoading: false,
  error: null
})

/**
 * Update user state
 * @param {User} user - User instance
 */
export const setUser = (user) => {
  state.user = user
  state.isAuthenticated = !!user
}

/**
 * Clear user state
 */
export const clearUser = () => {
  state.user = null
  state.isAuthenticated = false
}

/**
 * Set loading state
 * @param {boolean} loading - Loading state
 */
export const setLoading = (loading) => {
  state.isLoading = loading
}

/**
 * Set error state
 * @param {string|null} error - Error message
 */
export const setError = (error) => {
  state.error = error
}

/**
 * Clear error state
 */
export const clearError = () => {
  state.error = null
}

/**
 * Get current user
 * @returns {User|null} Current user
 */
export const getUser = () => {
  return state.user
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const checkAuth = () => {
  return state.isAuthenticated
}

/**
 * Get user ID
 * @returns {number|null} User ID or null
 */
export const getUserId = () => {
  return state.user?.id || null
}

/**
 * Get username
 * @returns {string|null} Username or null
 */
export const getUsername = () => {
  return state.user?.username || null
}

/**
 * Get user email
 * @returns {string|null} Email or null
 */
export const getUserEmail = () => {
  return state.user?.email || null
}

/**
 * Check if user has a specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (role) => {
  return state.user?.hasRole(role) || false
}

/**
 * Check if user is admin
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  return state.user?.isAdmin() || false
}

/**
 * Check if user is moderator
 * @returns {boolean} True if user is moderator
 */
export const isModerator = () => {
  return state.user?.isModerator() || false
}

// Export readonly state for components to use
export const authStore = readonly(state)

// Export all functions as default
export default {
  state: authStore,
  setUser,
  clearUser,
  setLoading,
  setError,
  clearError,
  getUser,
  checkAuth,
  getUserId,
  getUsername,
  getUserEmail,
  hasRole,
  isAdmin,
  isModerator
}
