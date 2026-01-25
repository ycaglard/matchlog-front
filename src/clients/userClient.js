import { ref } from 'vue'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Get authorization headers with token
 * @returns {Object} Headers object
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('matchlog_auth_token')
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Handle API responses
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} Parsed JSON response
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    
    console.error('API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorText
    })
    
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
 * Parse comment data from API response
 * @param {Object} data - Raw comment data
 * @returns {Object} Parsed comment
 */
const parseComment = (data) => {
  return {
    id: data.id,
    text: data.text,
    createdAt: data.createdAt ? new Date(data.createdAt) : null,
    userId: data.userId,
    username: data.username,
    userEmail: data.userEmail,
    eventId: data.eventId
  }
}

/**
 * Composable for user-related API calls
 * @returns {Object} User client methods
 */
export const useUserClient = () => {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Get user details by username
   * Note: According to API docs, this endpoint is PUBLIC and doesn't require auth
   * Making request without auth headers as documented
   * @param {string} username - Username
   * @returns {Promise<Object>} User data
   */
  const getUserByUsername = async (username) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Fetching user with username:', username)
      console.log('Making PUBLIC request (no auth headers per documentation)')
      
      // Make request WITHOUT auth headers as docs specify endpoint is public
      const response = await fetch(`${API_BASE_URL}/api/users/username/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', response.status)
      
      const data = await handleResponse(response)
      console.log('User data received:', data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching user by username:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get comments by user ID
   * Note: This endpoint requires authentication
   * @param {string} userId - User ID (MongoDB ObjectId)
   * @returns {Promise<Array>} List of comments by the user
   */
  const getCommentsByUserId = async (userId) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Fetching comments for user:', userId)
      console.log('Sending request WITH auth headers')
      
      // Comments endpoint requires authentication
      const response = await fetch(`${API_BASE_URL}/api/comments/user/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      console.log('Comments response status:', response.status)
      
      const data = await handleResponse(response)
      return Array.isArray(data) ? data.map(parseComment) : []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching user comments:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getUserByUsername,
    getCommentsByUserId
  }
}
