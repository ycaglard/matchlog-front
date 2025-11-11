import { ref } from 'vue'
import User from '../models/User.js'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Token storage keys
const TOKEN_KEY = 'matchlog_auth_token'
const USER_KEY = 'matchlog_user_data'

/**
 * Handle API responses
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} Parsed JSON response
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }
    
    throw new Error(errorMessage)
  }
  return response.json()
}

/**
 * Get authorization headers with token
 * @returns {Object} Headers object
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Store authentication token
 * @param {string} token - JWT token
 */
export const storeToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Get stored authentication token
 * @returns {string|null} Token or null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Remove authentication token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Store user data
 * @param {User} user - User instance
 */
export const storeUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user.toJSON()))
}

/**
 * Get stored user data
 * @returns {User|null} User instance or null
 */
export const getStoredUser = () => {
  const userData = localStorage.getItem(USER_KEY)
  if (userData) {
    try {
      const parsedData = JSON.parse(userData)
      return User.fromJSON(parsedData)
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      return null
    }
  }
  return null
}

/**
 * Remove stored user data
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY)
}

/**
 * Register a new user
 * API Endpoint: POST /api/auth/register
 * Body: { username, email, password, roles (optional) }
 * Returns: User object (no token on registration)
 * 
 * @param {Object} registrationData - Registration data
 * @param {string} registrationData.username - Username
 * @param {string} registrationData.email - Email
 * @param {string} registrationData.password - Password
 * @param {string[]} [registrationData.roles] - User roles (optional, defaults to ["USER"])
 * @returns {Promise<User>} Created user
 */
export const register = async (registrationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
        roles: registrationData.roles || ['USER']
      })
    })
    
    const data = await handleResponse(response)
    
    // Parse user (registration doesn't return token according to API)
    const user = User.fromJSON(data)
    
    return user
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

/**
 * Login user
 * API Endpoint: POST /api/auth/login
 * Body: { username, password }
 * Returns: { token: "jwt-token-here" }
 * 
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Promise<{token: string}>} JWT token
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      })
    })
    
    const data = await handleResponse(response)
    
    // Store token
    const token = data.token
    
    if (token) {
      storeToken(token)
    }
    
    return { token }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

/**
 * Logout user
 */
export const logout = () => {
  removeToken()
  removeUser()
}

/**
 * Get current user profile from backend
 * API Endpoint: GET /api/auth/me
 * Headers: Authorization: Bearer {token}
 * Returns: User object
 * 
 * @returns {Promise<User>} User instance
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    const user = User.fromJSON(data)
    
    // Update stored user data
    storeUser(user)
    
    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    throw error
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!getToken()
}

/**
 * Verify if token is valid by checking with backend
 * @returns {Promise<boolean>} True if token is valid
 */
export const verifyToken = async () => {
  if (!isAuthenticated()) {
    return false
  }
  
  try {
    await getCurrentUser()
    return true
  } catch (error) {
    // Token is invalid or expired
    logout()
    return false
  }
}

// Default export
export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  verifyToken,
  getToken,
  storeToken,
  removeToken,
  getStoredUser,
  storeUser,
  removeUser
}

/**
 * Composable for auth operations in Vue components
 * @returns {Object} Auth methods and reactive state
 */
export const useAuth = () => {
  const loading = ref(false)
  const error = ref(null)
  const user = ref(getStoredUser())
  const isAuth = ref(isAuthenticated())

  const executeWithLoading = async (apiCall) => {
    loading.value = true
    error.value = null
    try {
      const result = await apiCall()
      return result
    } catch (err) {
      error.value = err.message || 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const handleLogin = async (credentials) => {
    const result = await executeWithLoading(() => login(credentials))
    // After login, fetch the user profile
    const currentUser = await executeWithLoading(() => getCurrentUser())
    user.value = currentUser
    isAuth.value = true
    return result
  }

  const handleRegister = async (registrationData) => {
    const newUser = await executeWithLoading(() => register(registrationData))
    // After registration, automatically login
    await handleLogin({
      username: registrationData.username,
      password: registrationData.password
    })
    return newUser
  }

  const handleLogout = () => {
    logout()
    user.value = null
    isAuth.value = false
  }

  const refreshUser = async () => {
    if (!isAuth.value) return null
    try {
      const updatedUser = await executeWithLoading(() => getCurrentUser())
      user.value = updatedUser
      return updatedUser
    } catch (err) {
      // Token invalid, logout
      handleLogout()
      return null
    }
  }

  return {
    loading,
    error,
    user,
    isAuthenticated: isAuth,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser
  }
}
